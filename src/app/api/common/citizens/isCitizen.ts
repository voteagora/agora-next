import { Prisma } from "@prisma/client";
import { cache } from "react";
import { prismaWeb2Client } from "@/app/lib/web2";
import Tenant from "@/lib/tenant/tenant";
import { addressOrEnsNameWrap } from "../utils/ensName";

const isCitizen = async (addressOrEnsName: string) =>
  addressOrEnsNameWrap(isCitizenForAddress, addressOrEnsName);

async function isCitizenForAddress({ address }: { address: string }) {
  const { slug } = Tenant.current();

  const citizen = await prismaWeb2Client.$queryRaw<
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
