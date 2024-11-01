import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { cache } from "react";

async function getMetrics() {
  const { namespace, contracts } = Tenant.current();

  try {
    let totalSupply;
    if (contracts.token.isERC20()) {
      totalSupply = await contracts.token.contract.totalSupply();
    } else if (contracts.token.isERC721()) {
      totalSupply = 0;
    } else {
      totalSupply = 0;
    }

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
      totalSupply: "0",
    };
  }
}

export const fetchMetrics = cache(getMetrics);
