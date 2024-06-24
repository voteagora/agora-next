import { paginateResultEx } from "@/app/lib/pagination";
import { cache } from "react";
import { addressOrEnsNameWrap } from "../utils/ensName";
import { Ballots } from "@prisma/client";
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
  return paginateResultEx(
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

  if (!ballot) {
    return {
      address,
      round_id: roundId,
      allocations: [],
    };
  }

  return calculateAllocations(ballot);
}

export const fetchBallots = cache(getBallotsApi);
export const fetchBallot = cache(getBallotApi);
