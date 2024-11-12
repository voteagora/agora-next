import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { cache } from "react";
import { IMembershipContract } from "@/lib/contracts/common/interfaces/IMembershipContract";
import { getPublicClient } from "@/lib/viem";
async function getMetrics() {
  const { namespace, contracts } = Tenant.current();

  try {
    let totalSupply;
    if (contracts.token.isERC20()) {
      totalSupply = await contracts.token.contract.totalSupply();
    } else if (contracts.token.isERC721()) {
      const token = contracts.token.contract as IMembershipContract;
      const publicClient = getPublicClient(contracts.token.chain.id);
      const blockNumber = await publicClient.getBlockNumber();
      totalSupply = await token.getPastTotalSupply(Number(blockNumber) - 1);
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
