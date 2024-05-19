import { paginateResultEx } from "@/app/lib/pagination";
import { cache } from "react";
import { addressOrEnsNameWrap } from "../utils/ensName";
import { Ballots, allocations } from "@prisma/client";
import { Ballot } from "./ballot";

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
  const ballot = await prisma.$queryRawUnsafe<Ballot>(
    `
    WITH metric_totals AS (
      SELECT 
          mp.metric_id,
          SUM(mp.values) AS total_values,
          SUM(CASE WHEN mp.is_os THEN mp.values * b.os_multiplier ELSE mp.values END) AS adjusted_total_values
      FROM 
          retro_funding.metrics_projects mp
      JOIN 
          retro_funding.allocations a
      ON 
          mp.metric_id = a.metric_id
      JOIN 
          retro_funding.ballots b
      ON 
          a.address = b.address AND a.round = b.round
      GROUP BY 
          mp.metric_id, b.os_multiplier
  )
  , weighted_allocations AS (
      SELECT 
          a.address,
          a.round,
          a.metric_id,
          mp.project_id,
          mp.is_os,
          mp.values,
          b.os_only,
          b.os_multiplier,
          CASE 
              WHEN b.os_only = TRUE AND mp.is_os = FALSE THEN 0
              ELSE mp.values
          END AS weighted_values,
          CASE 
              WHEN mp.is_os = TRUE THEN (mp.values * b.os_multiplier)
              ELSE mp.values
          END AS adjusted_values
      FROM 
          retro_funding.allocations a
      JOIN 
          retro_funding.ballots b
      ON 
          a.address = b.address AND a.round = b.round
      JOIN 
          retro_funding.metrics_projects mp
      ON 
          a.metric_id = mp.metric_id
  )
  , normalized_allocations AS (
      SELECT 
          wa.address,
          wa.round,
          wa.project_id,
          wa.is_os,
          wa.weighted_values,
          wa.adjusted_values,
          mt.adjusted_total_values,
          wa.adjusted_values / mt.adjusted_total_values AS normalized_allocation
      FROM 
          weighted_allocations wa
      JOIN 
          metric_totals mt
      ON 
          wa.metric_id = mt.metric_id
  )
  SELECT 
      b.*,
      CASE 
          WHEN EXISTS (
              SELECT 1 
              FROM retro_funding.ballot_submittions bs 
              WHERE bs.address = b.address AND bs.round = b.round
          ) THEN 'SUBMITTED'
          ELSE 'PENDING'
      END AS status,
      COALESCE(
          (SELECT json_agg(json_build_object('project_id', na.project_id, 'allocation_share', na.normalized_allocation, 'allocation_amount', ROUND(na.normalized_allocation * 10000000)) ORDER BY na.normalized_allocation DESC) 
          FROM normalized_allocations na
          WHERE na.address = b.address AND na.round = b.round),
          '[]'::json
      ) AS project_allocations
  FROM 
      retro_funding.ballots b
  WHERE
    b.round = 4 AND b.address = $2
  `,
    roundId,
    address
  );

  if (!ballot) {
    return {
      address,
      roundId,
      allocations: [],
    };
  }

  return ballot;
}

export const fetchBallots = cache(getBallotsApi);
export const fetchBallot = cache(getBallotApi);
