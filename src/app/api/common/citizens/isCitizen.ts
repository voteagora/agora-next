import { Prisma } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { deploymentToDaoSlug } from "@/lib/config";

export async function isCitizenForNamespace(
  address: string,
  namespace: "optimism"
) {
  const daoSlug = deploymentToDaoSlug(namespace);

  return prisma.$queryRaw<
    {
      address: string;
    }[]
  >(
    Prisma.sql`
    SELECT address
    FROM center.address_metadata
    WHERE kind = 'citizen' 
    AND dao_slug = ${daoSlug}
    AND LOWER(address) = LOWER(${address});
    `
  );
}
