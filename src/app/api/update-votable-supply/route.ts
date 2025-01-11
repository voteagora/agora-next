import { NextRequest } from "next/server";
import Tenant from "@/lib/tenant/tenant";
import { DaoSlug } from "@prisma/client";
import { fetchVotableSupply } from "../common/votableSupply/getVotableSupply";
import { getTransportForChain } from "@/lib/utils";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getPublicClient } from "@/lib/viem";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  // Only allow this route to be accessed from the OP namespace
  const slug = Tenant.current().slug;
  if (slug === DaoSlug.OP) {
    const actualVotableSupply = await fetchVotableSupply();

    const votableSupplyOracle = Tenant.current().contracts.votableSupplyOracle!;

    const transport = getTransportForChain(votableSupplyOracle.chain.id)!;
    const walletClient = createWalletClient({
      chain: votableSupplyOracle.chain,
      transport,
    });

    const account = privateKeyToAccount(
      process.env.SPONSOR_PRIVATE_KEY! as `0x${string}`
    );

    const publicClient = getPublicClient(votableSupplyOracle.chain.id);

    const { request } = await publicClient.simulateContract({
      address: votableSupplyOracle.address as `0x${string}`,
      abi: votableSupplyOracle.abi as const,
      functionName: "_updateVotableSupply",
      args: [actualVotableSupply],
      account: account,
    });

    return walletClient.writeContract(request);
  }
}
