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
    FROM agora.address_metadata
    WHERE kind = 'citizen' 
    AND dao_slug = ${slug}::config.dao_slug
    AND LOWER(address) = LOWER(${address});
    `
  );
}

export const fetchIsCitizen = cache(isCitizen);
