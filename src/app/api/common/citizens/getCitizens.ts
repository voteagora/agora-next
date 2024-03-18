import "server-only";

import { paginatePrismaResult } from "@/app/lib/pagination";
import { Prisma } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { getDelegateStatement } from "../delegateStatement/getDelegateStatement";
import Tenant from "@/lib/tenant/tenant";

type citizen = {
  address: string;
  kind: string;
  dao_slug: string;
  metadata: object | null;
  created_at: Date;
  voting_power?: Prisma.Decimal;
};

export async function getCitizens({
  page = 1,
  sort = "shuffle",
  seed,
}: {
  page: number;
  sort: string;
  seed?: number;
}) {
  const pageSize = 20;
  const { namespace } = Tenant.current();

  const { meta, data: _citizens } = await paginatePrismaResult(
    (skip: number, take: number) => {
      if (sort === "shuffle") {
        return prisma.$queryRawUnsafe<citizen[]>(
          `
          SELECT address_metadata.address, address_metadata.metadata, delegate.voting_power
          FROM agora.address_metadata address_metadata
          LEFT JOIN ${namespace + ".delegates"
          } delegate ON LOWER(address_metadata.address) = LOWER(delegate.delegate)
          WHERE address_metadata.kind = 'citizen' 
          AND address_metadata.dao_slug = 'OP'
          ORDER BY md5(CAST(address_metadata.address AS TEXT) || CAST($1 AS TEXT))
          OFFSET $2
          LIMIT $3;        
            `,
          seed,
          skip,
          take
        );
      } else {
        return prisma.$queryRawUnsafe<citizen[]>(
          `
            SELECT address_metadata.address, address_metadata.metadata, delegate.voting_power
            FROM agora.address_metadata address_metadata
            LEFT JOIN ${namespace + ".delegates"
          } delegate ON LOWER(address_metadata.address) = LOWER(delegate.delegate)
            WHERE address_metadata.kind = 'citizen' 
            AND address_metadata.dao_slug = 'OP'
            ORDER BY COALESCE(delegate.voting_power, 0) DESC,
            address_metadata.address ASC 
            OFFSET $1
            LIMIT $2;
          `,
          skip,
          take
        );
      }
    },
    page,
    pageSize
  );

  const citizens = await Promise.all(
    _citizens.map(async (citizen) => {
      const statement = await getDelegateStatement(citizen.address);
      const { address, metadata } = citizen;
      return {
        address,
        metadata,
        votingPower: citizen.voting_power?.toFixed(0) || "0",
        // Mark as citizen to display badge
        citizen: true,
        statement,
      };
    })
  );

  return {
    meta,
    delegates: citizens,
    seed,
  };
}
