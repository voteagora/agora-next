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
