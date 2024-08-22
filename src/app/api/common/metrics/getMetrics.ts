import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { cache } from "react";

async function getMetrics() {
  const { namespace, contracts } = Tenant.current();
  const totalSupply = await contracts.token.contract.totalSupply();

  try {
    const votableSupply = await prisma[`${namespace}VotableSupply`].findFirst(
      {}
    );
    return {
      votableSupply: votableSupply?.votable_supply || "0",
      totalSupply: totalSupply.toString(),
    };
  } catch (e) {
    // Handle prisma errors for new tenants
    return {
      votableSupply: "0",
      totalSupply: totalSupply.toString(),
    };
  }
}

export const fetchMetrics = cache(getMetrics);
