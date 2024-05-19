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
      (SELECT json_agg(a.* ORDER BY a.allocation DESC) 
      FROM retro_funding.allocations a
      WHERE a.address = b.address AND a.round = b.round),
      '[]'::json
    ) AS metrics_allocations,
    COALESCE(
        (SELECT json_agg(json_build_object('project_id', subquery.project_id, 'allocation', subquery.total_allocation_multiplied) ORDER BY subquery.total_allocation DESC) 
        FROM (
            SELECT 
                mp.project_id,
                CASE 
                    WHEN b.os_only = TRUE AND mp.is_os = FALSE THEN 0
                    ELSE SUM(a.allocation * mp.allocation)
                END AS total_allocation,
                CASE 
                    WHEN b.os_only = TRUE AND mp.is_os = FALSE THEN 0
                    ELSE ROUND(SUM(a.allocation * mp.allocation) * 10000000)
                END AS total_allocation_multiplied
            FROM 
                retro_funding.allocations a
            JOIN 
                retro_funding.metrics_projects mp
            ON a.metric_id = mp.metric_id
            WHERE a.address = b.address AND a.round = b.round
            GROUP BY 
                mp.project_id, b.os_only, mp.is_os
        ) AS subquery
        ),
        '[]'::json
    ) AS project_allocations
    FROM 
    retro_funding.ballots b
    WHERE round = $1 AND address = $2
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
