import "server-only";

import { cache } from "react";
import {
  PaginatedResult,
  paginateResult,
  PaginationParams,
} from "@/app/lib/pagination";
import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { DelegateChunk, DelegatesGetPayload } from "../delegates/delegate";

async function getCitizens({
  pagination = { limit: 10, offset: 0 },
  sort = "shuffle",
  seed,
}: {
  pagination: PaginationParams;
  sort: string;
  seed?: number;
}): Promise<PaginatedResult<DelegateChunk[]>> {
  const { namespace, slug } = Tenant.current();

  const { meta, data: citizens } = await paginateResult(
    (skip: number, take: number) => {
      if (sort === "shuffle") {
        return prisma.$queryRawUnsafe<DelegatesGetPayload[]>(
          `
          SELECT 
            citizens.address AS delegate,
            delegate.voting_power,
            advanced_vp,
            TRUE AS citizen,
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
        return prisma.$queryRawUnsafe<DelegatesGetPayload[]>(
          `
            SELECT 
              citizens.address AS delegate,
              delegate.voting_power,
              direct_vp,
              advanced_vp,
              TRUE AS citizen,
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
    pagination
  );

  return {
    meta,
    data: citizens.map((citizen) => ({
      address: citizen.delegate,
      votingPower: {
        total: citizen.voting_power?.toFixed(0) || "0",
        direct: citizen.direct_vp?.toFixed(0) || "0",
        advanced: citizen.advanced_vp?.toFixed(0) || "0",
      },
      citizen: citizen.citizen,
      statement: citizen.statement,
    })),
    seed,
  };
}

export const fetchCitizens = cache(getCitizens);
