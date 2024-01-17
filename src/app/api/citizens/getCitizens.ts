import "server-only";

import { paginatePrismaResult } from "@/app/lib/pagination";
import { Prisma } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { getDelegateStatement } from "../delegateStatement/getDelegateStatement";
import { getDelegate } from "../delegates/getDelegates";

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
  // TODO: frh -> sort by mostVotingPower

  const { meta, data: _citizens } = await paginatePrismaResult(
    (skip: number, take: number) => {
      return prisma.$queryRaw<{
        address: string;
        kind: string;
        dao_slug: string;
        metadata: object | null;
        created_at: Date
      }[]>(
        Prisma.sql`
          SELECT *, setseed(${seed})::Text
          FROM center.address_metadata
          WHERE kind = 'citizen' 
          AND dao_slug = 'OP'
          ORDER BY random()
          OFFSET ${skip}
          LIMIT ${take};
          `
      )
    },
    page,
    pageSize
  );

  const citizens = await Promise.all(
    _citizens.map(async (citizen) => {
      const delegate = await getDelegate({ addressOrENSName: citizen.address });
      const statement = await getDelegateStatement({ addressOrENSName: citizen.address });
      return {
        ...citizen,
        // Mark as citizen to display badge
        citizen: true,
        votingPower: delegate.votingPower,
        statement
      }
    })
  );

  return {
    meta,
    delegates: citizens
  };
}