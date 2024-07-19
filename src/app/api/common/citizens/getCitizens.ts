import "server-only";

import { cache } from "react";
import { paginateResult } from "@/app/lib/pagination";
import { Prisma } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";

type citizen = {
  address: string;
  voting_power?: Prisma.Decimal;
  statement?: {
    signature: string;
    payload: string;
    twitter: string;
    discord: string;
    created_at: Date;
    updated_at: Date;
    warpcast: string;
  };
};

async function getCitizens({
  page = 1,
  sort = "shuffle",
  seed,
}: {
  page: number;
  sort: string;
  seed?: number;
}) {
  const pageSize = 20;
  const { namespace, slug } = Tenant.current();

  const { meta, data: _citizens } = await paginateResult(
    (skip: number, take: number) => {
      if (sort === "shuffle") {
        return prisma.$queryRawUnsafe<citizen[]>(
          `
          SELECT 
            citizens.address, 
            delegate.voting_power,
            (SELECT row_to_json(sub)
              FROM (
                SELECT
                  signature,
                  payload,
                  twitter,
                  discord,
                  created_at,
                  updated_at,
                  warpcast
                FROM agora.delegate_statements s
                WHERE s.address = LOWER(citizens.address) AND s.dao_slug = $1::config.dao_slug
                LIMIT 1
              ) sub
            ) AS statement
          FROM agora.citizens citizens
          LEFT JOIN ${
            namespace + ".delegates"
          } delegate ON LOWER(citizens.address) = LOWER(delegate.delegate)
          AND citizens.dao_slug = $1::config.dao_slug
          WHERE citizens.retro_funding_round = (SELECT MAX(retro_funding_round) FROM agora.citizens)
          ORDER BY md5(CAST(citizens.address AS TEXT) || CAST($2 AS TEXT))
          OFFSET $3
          LIMIT $4;        
            `,
          slug,
          seed,
          skip,
          take
        );
      } else {
        return prisma.$queryRawUnsafe<citizen[]>(
          `
            SELECT 
              citizens.address, 
              delegate.voting_power,
              (SELECT row_to_json(sub)
                FROM (
                  SELECT
                    signature,
                    payload,
                    twitter,
                    discord,
                    created_at,
                    updated_at,
                    warpcast
                  FROM agora.delegate_statements s
                  WHERE s.address = LOWER(citizens.address) AND s.dao_slug = $1::config.dao_slug
                  LIMIT 1
                ) sub
              ) AS statement
            FROM agora.citizens citizens
            LEFT JOIN ${
              namespace + ".delegates"
            } delegate ON LOWER(citizens.address) = LOWER(delegate.delegate)
            AND citizens.dao_slug = $1::config.dao_slug
            WHERE citizens.retro_funding_round = (SELECT MAX(retro_funding_round) FROM agora.citizens)
            ORDER BY COALESCE(delegate.voting_power, 0) DESC,
            citizens.address ASC 
            OFFSET $2
            LIMIT $3;
          `,
          slug,
          skip,
          take
        );
      }
    },
    page,
    pageSize
  );

  const citizens = _citizens.map((citizen) => {
    const { address } = citizen;
    return {
      address,
      votingPower: citizen.voting_power?.toFixed(0) || "0",
      citizen: true,
      statement: citizen.statement,
    };
  });

  return {
    meta,
    delegates: citizens,
    seed,
  };
}

export const fetchCitizens = cache(getCitizens);
