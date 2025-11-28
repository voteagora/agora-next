import { paginateResult } from "@/app/lib/pagination";
import { cache } from "react";
import { addressOrEnsNameWrap } from "../utils/ensName";
import { Ballots, Prisma, ProjectApplicants } from "@prisma/client";
import { Ballot } from "./ballot";
import { prismaWeb2Client } from "@/app/lib/web2";
import { calculateAllocations } from "./ballotAllocations";

async function getBallotsApi({
  roundId,
  limit,
  offset,
}: {
  roundId: number;
  limit: number;
  offset: number;
}) {
  return paginateResult(
    (skip: number, take: number) => {
      return prismaWeb2Client.$queryRawUnsafe<Ballots[]>(
        `
          SELECT 
            *,
          CASE 
            WHEN EXISTS (
              SELECT 1 
              FROM retro_funding.ballot_submittions bs 
              WHERE bs.address = b.address AND bs.round = b.round
            ) THEN 'SUBMITTED'
            ELSE 'PENDING'
          END AS status,
          (
            SELECT updated_at
            FROM retro_funding.ballot_submittions bs 
            WHERE bs.address = b.address AND bs.round = b.round
          ) as published_at,
          COALESCE(
            (SELECT json_agg(a.* ORDER BY a.allocation DESC) 
            FROM retro_funding.allocations a 
            WHERE a.address = b.address AND a.round = b.round),
            '[]'::json
          ) AS allocations
          FROM 
            retro_funding.ballots b
          WHERE round = $1
          ORDER BY address, round
          LIMIT $2
          OFFSET $3;
        `,
        roundId,
        take,
        skip
      );
    },
    { limit, offset }
  );
}

const getBallotApi = async (
  roundId: number,
  ballotCasterAddressOrEns: string,
  category?: string
) =>
  addressOrEnsNameWrap(getBallotForAddress, ballotCasterAddressOrEns, {
    category,
    roundId,
  });

async function getBallotForAddress({
  category,
  roundId,
  address,
}: {
  category?: string;
  roundId: number;
  address: string;
}) {
  if (roundId === 4) {
    return getR4Ballot({ roundId, address });
  }

  if (!category) {
    throw new Error("Category scope is required");
  }
  return getR5Ballot({ roundId, address, category });
}

async function getR5Ballot({
  roundId,
  address,
  category,
}: {
  roundId: number;
  address: string;
  category: string;
}) {
  const [ballot, projects, ballotSubmission] = await Promise.all([
    prismaWeb2Client.ballots.findFirst({
      where: {
        round: roundId,
        address,
      },
      include: {
        project_allocations: {
          include: {
            projects_data: true,
          },
          orderBy: {
            rank: "desc",
          },
        },
        category_allocations: {
          orderBy: {
            allocation: "desc",
          },
        },
      },
    }),
    prismaWeb2Client.$queryRaw<ProjectApplicants[]>`
      SELECT 
        *
      FROM 
        retro_funding.project_applicants_final
      WHERE application_category = ${category}
      ORDER BY RANDOM();
    `,
    prismaWeb2Client.ballotSubmittions.findFirst({
      where: {
        address,
        round: roundId,
      },
    }),
  ]);

  if (!ballot) {
    return {
      address,
      round_id: roundId,
      status: "NOT STARTED",
      budget: null,
      project_allocations: [],
      category_allocations: [],
      projects_to_be_evaluated: projects.map(
        (project) => project.application_id
      ),
      total_projects: projects.length,
      payload_for_signature: {},
      created_at: null,
      updated_at: null,
      submitted_at: ballotSubmission?.updated_at,
    };
  }

  if (ballot.project_allocations.length < projects.length || !ballot.budget) {
    return {
      address: ballot.address,
      round_id: ballot.round,
      status: "APP RANKING",
      budget: ballot.budget,
      project_allocations: parseProjectAllocations(ballot.project_allocations),
      category_allocations: ballot.category_allocations,
      projects_to_be_evaluated: projects
        .filter(
          (project) =>
            !ballot.project_allocations.some(
              (allocation) => allocation.project_id === project.application_id
            )
        )
        .map((project) => project.application_id),
      total_projects: projects.length,
      payload_for_signature: {},
      created_at: ballot.created_at,
      updated_at: ballot.updated_at,
      submitted_at: ballotSubmission?.updated_at,
    };
  }

  return {
    address: ballot.address,
    round_id: ballot.round,
    status: ballotSubmission ? "SUBMITTED" : "PENDING SUBMISSION",
    budget: ballot.budget,
    project_allocations: parseProjectAllocations(ballot.project_allocations),
    category_allocations: ballot.category_allocations,
    projects_to_be_evaluated: [],
    total_projects: projects.length,
    payload_for_signature: {
      budget: ballot.budget,
      project_allocations: ballot.project_allocations.map((allocation) => ({
        [allocation.project_id]: allocation.allocation,
      })),
      category_allocations: ballot.category_allocations.map((allocation) => ({
        [allocation.category_slug]: allocation.allocation,
      })),
    },
    created_at: ballot.created_at,
    updated_at: ballot.updated_at,
    submitted_at: ballotSubmission?.updated_at,
  };
}

function parseProjectAllocations(
  allocations: Prisma.ProjectAllocationsGetPayload<{
    include: { projects_data: true };
  }>[]
) {
  return allocations.map((allocation, i) => ({
    project_id: allocation.project_id,
    name: allocation.projects_data.name,
    image: (allocation.projects_data.ipfs_data ?? ({} as any)).projectAvatarUrl,
    position: i,
    allocation: allocation.allocation,
    impact: allocation.impact,
  }));
}

async function getR4Ballot({
  roundId,
  address,
}: {
  roundId: number;
  address: string;
}) {
  const ballot = await prismaWeb2Client.$queryRawUnsafe<Ballot[]>(
    `
  SELECT 
    b.address,
    b.round,
    CASE WHEN EXISTS (
                SELECT 1 
                FROM retro_funding.ballot_submittions bs 
                WHERE bs.address = b.address AND bs.round = b.round
            ) THEN 'SUBMITTED'
            ELSE 'PENDING'
        END AS status,
    b.created_at,
    b.updated_at,
    (
      SELECT updated_at
      FROM retro_funding.ballot_submittions bs 
      WHERE bs.address = b.address AND bs.round = b.round
    ) as published_at,
    os_only, 
    os_multiplier, 
    a.metric_id, 
    a.allocation,
    locked,
    COALESCE(
      (SELECT json_agg(json_build_object(
              'project_id', pd.project_id, 
              'name', pd.project_name,
              'image', pd.project_image,
              'is_os', mp.is_os,
              'value', mp.values
      ))
      FROM retro_funding.metrics_projects mp
      JOIN retro_funding.projects_data pd ON mp.project_id = pd.project_id
      WHERE mp.metric_id = a.metric_id),
      '[]'::json
    ) AS allocations
  FROM retro_funding.ballots b
  JOIN retro_funding.allocations a ON b.address = a.address AND b.round = a.round
  WHERE 
    b.round = $1 AND b.address = $2;
`,
    roundId,
    address
  );

  if (ballot.length === 0) {
    return {
      address,
      round_id: roundId,
      allocations: [],
    };
  }

  return [calculateAllocations(ballot)];
}

export const fetchBallots = cache(getBallotsApi);
export const fetchBallot = cache(getBallotApi);
