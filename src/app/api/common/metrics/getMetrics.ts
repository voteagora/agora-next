import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { cache } from "react";

async function getMetrics() {
  const { namespace, contracts } = Tenant.current();

  if (
    contracts.token.address === "0x0000000000000000000000000000000000000000"
  ) {
    return {
      votableSupply: 0,
      totalSupply: 0,
    };
  }

  const totalSupply = await contracts.token.contract.totalSupply();
  const votableSupply = await prisma[`${namespace}VotableSupply`].findFirst({});

  return {
    votableSupply: votableSupply?.votable_supply || "0",
    totalSupply: totalSupply.toString(),
  };
}

export const fetchMetrics = cache(getMetrics);
