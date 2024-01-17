import "server-only";

import { Prisma } from "@prisma/client";
import prisma from "@/app/lib/prisma";

export async function isCitizen(address: string) {
  return prisma.$queryRaw<{
    address: string;
  }[]>(
    Prisma.sql`
    SELECT address
    FROM center.address_metadata
    WHERE kind = 'citizen' 
    AND dao_slug = 'OP'
    AND address = ${address}
    `,
  )
}