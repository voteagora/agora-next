import "server-only";

import { paginatePrismaResult } from "@/app/lib/pagination";
import { Prisma } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { getDelegateStatement } from "../delegateStatement/getDelegateStatement";

type citizen = {
  address: string;
  kind: string;
  dao_slug: string;
  metadata: object | null;
  created_at: Date,
  voting_power: Prisma.Decimal
}

export async function getCitizens({
  page = 1,
  sort = "shuffle",
  seed = Math.random(),
}: {
  page: number;
  sort: string;
  seed?: number;
}) {
  const pageSize = 20;

  const { meta, data: _citizens } = await paginatePrismaResult(
    (skip: number, take: number) => {
      if (sort === "shuffle") {
        return prisma.$queryRaw<citizen[]>(
          Prisma.sql`
            SELECT address_metadata.address, address_metadata.metadata, delegate.voting_power, setseed(${seed})::Text
            FROM center.address_metadata address_metadata
            JOIN center.delegates delegate ON LOWER(address_metadata.address) = LOWER(delegate.delegate)
            WHERE address_metadata.kind = 'citizen' 
            AND address_metadata.dao_slug = 'OP'
            ORDER BY random()
            OFFSET ${skip}
            LIMIT ${take};
            `
        )
      } else {
        return prisma.$queryRaw<citizen[]>(
          Prisma.sql`
            SELECT address_metadata.address, address_metadata.metadata, delegate.voting_power
            FROM center.address_metadata address_metadata
            JOIN center.delegates delegate ON LOWER(address_metadata.address) = LOWER(delegate.delegate)
            WHERE address_metadata.kind = 'citizen' 
            AND address_metadata.dao_slug = 'OP'
            ORDER BY delegate.voting_power DESC
            OFFSET ${skip}
            LIMIT ${take};
          `
        )
      }
    },
    page,
    pageSize
  );

  const citizens = await Promise.all(
    _citizens.map(async (citizen) => {
      const statement = await getDelegateStatement({ addressOrENSName: citizen.address });
      const { address, metadata } = citizen;
      return {
        address,
        metadata,
        votingPower: citizen.voting_power?.toFixed(0),
        // Mark as citizen to display badge
        citizen: true,
        statement
      }
    })
  );

  return {
    meta,
    delegates: citizens
  };
}