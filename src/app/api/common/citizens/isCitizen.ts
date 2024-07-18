import { Prisma } from "@prisma/client";
import { cache } from "react";
import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { addressOrEnsNameWrap } from "../utils/ensName";

const isCitizen = async (addressOrEnsName: string) =>
  addressOrEnsNameWrap(isCitizenForAddress, addressOrEnsName);

async function isCitizenForAddress({ address }: { address: string }) {
  const { slug } = Tenant.current();

  if (allowList.includes(address)) {
    return true;
  }

  const citizen = await prisma.$queryRaw<
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

  return citizen.length > 0;
}

export const fetchIsCitizen = cache(isCitizen);

const allowList = [
  "0x849151d7d0bf1f34b70d5cad5149d28cc2308bf1", // Jesse
];
