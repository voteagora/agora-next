import { Prisma } from "@prisma/client";
import { cache } from "react";
import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";

async function isCitizen(address: string) {
  const { slug } = Tenant.current();

  return prisma.$queryRaw<
    {
      address: string;
    }[]
  >(
    Prisma.sql`
    SELECT address
    FROM agora.citizens
    WHERE dao_slug = ${slug}::config.dao_slug
    AND retro_funding_round = (SELECT MAX(retro_funding_round) FROM agora.citizens)
    AND LOWER(address) = LOWER(${address});
    `
  );
}

export const fetchIsCitizen = cache(isCitizen);
