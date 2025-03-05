import Tenant from "@/lib/tenant/tenant";
import { cache } from "react";
import { IMembershipContract } from "@/lib/contracts/common/interfaces/IMembershipContract";
import { getPublicClient } from "@/lib/viem";
import { findVotableSupply } from "@/lib/prismaUtils";

async function getMetrics() {
  const { namespace, contracts, ui } = Tenant.current();
  try {
    const getTotalSupply = async () => {
      if (contracts.token.isERC20()) {
        return contracts.token.contract.totalSupply();
      } else if (contracts.token.isERC721()) {
        const token = contracts.token.contract as IMembershipContract;
        const publicClient = getPublicClient(
          ui.toggle("use-l1-block-number")?.enabled
            ? contracts.chainForTime
            : contracts.token.chain
        );
        const blockNumber = await publicClient.getBlockNumber();
        return token.getPastTotalSupply(Number(blockNumber) - 1);
      } else {
        return 0;
      }
    };

    const [totalSupply, votableSupply] = await Promise.all([
      getTotalSupply(),
      findVotableSupply({
        namespace,
        address: contracts.token.address,
      }),
    ]);

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
