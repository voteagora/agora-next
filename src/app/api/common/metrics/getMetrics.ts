import Tenant from "@/lib/tenant/tenant";
import { cache } from "react";
import { IMembershipContract } from "@/lib/contracts/common/interfaces/IMembershipContract";
import { getPublicClient } from "@/lib/viem";
import { findVotableSupply } from "@/lib/prismaUtils";

async function getMetrics() {
  const { namespace, contracts, ui } = Tenant.current();

  try {
    let totalSupply;
    if (contracts.token.isERC20()) {
      totalSupply = await contracts.token.contract.totalSupply();
    } else if (contracts.token.isERC721()) {
      const token = contracts.token.contract as IMembershipContract;
      const publicClient = getPublicClient(
        ui.toggle("use-l1-block-number")?.enabled
          ? contracts.chainForTime
          : contracts.token.chain
      );
      const blockNumber = await publicClient.getBlockNumber();
      totalSupply = await token.getPastTotalSupply(Number(blockNumber) - 1);
    } else {
      totalSupply = 0;
    }

    const votableSupply = await findVotableSupply({
      namespace,
      address: contracts.token.address,
    });

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
