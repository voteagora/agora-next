import { paginateResult } from "@/app/lib/pagination";
import { cache } from "react";
import { addressOrEnsNameWrap } from "../utils/ensName";
import { Ballots, Prisma, projects_data } from "@prisma/client";
import { Ballot } from "./ballot";
import prisma from "@/app/lib/prisma";
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
      return prisma.$queryRawUnsafe<Ballots[]>(
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
  ballotCasterAddressOrEns: string
) =>
  addressOrEnsNameWrap(getBallotForAddress, ballotCasterAddressOrEns, {
    roundId,
  });

async function getBallotForAddress({
  roundId,
  address,
}: {
  roundId: number;
  address: string;
}) {
  if (roundId === 4) {
    return getR4Ballot({ roundId, address });
  }

  if (roundId === 5) {
    return getR5Ballot({ roundId, address });
  }
}

async function getR5Ballot({
  roundId,
  address,
}: {
  roundId: number;
  address: string;
}) {
  const [ballot, projects] = await Promise.all([
    prisma.ballots.findFirst({
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
    prisma.$queryRaw<projects_data[]>`
      SELECT 
        *
      FROM 
        retro_funding.projects_data
      ORDER BY RANDOM();
    `,
  ]);

  if (!ballot) {
    return {
      address,
      round_id: roundId,
      status: "NOT STARTED",
      project_allocations: [],
      category_allocations: [],
      projects_to_be_evaluated: projects.map((project) => project.project_id),
      total_projects: projects.length,
    };
  }

  if (ballot.project_allocations.length < projects.length) {
    return {
      address: ballot.address,
      round_id: ballot.round,
      status: "PROJECT RANKING",
      project_allocations: parseProjectAllocations(ballot.project_allocations),
      category_allocations: ballot.category_allocations,
      projects_to_be_evaluated: projects
        .filter(
          (project) =>
            !ballot.project_allocations.some(
              (allocation) => allocation.project_id === project.project_id
            )
        )
        .map((project) => project.project_id),
      total_projects: projects.length,
    };
  }

  return {
    address: ballot.address,
    round_id: ballot.round,
    status: "PENDING SUBMISSION",
    project_allocations: parseProjectAllocations(ballot.project_allocations),
    category_allocations: ballot.category_allocations,
    projects_to_be_evaluated: [],
    total_projects: projects.length,
  };
}

function parseProjectAllocations(
  allocations: Prisma.ProjectAllocationsGetPayload<{
    include: { projects_data: true };
  }>[]
) {
  return allocations.map((allocation, i) => ({
    project_id: allocation.project_id,
    name: allocation.projects_data.project_name,
    image: allocation.projects_data.project_image,
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
  const ballot = await prisma.$queryRawUnsafe<Ballot[]>(
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
