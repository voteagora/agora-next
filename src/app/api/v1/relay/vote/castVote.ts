import Tenant from "@/lib/tenant/tenant";
import { getTransportForChain } from "@/lib/utils";
import { getPublicClient } from "@/lib/viem";
import { createWalletClient, parseSignature, isHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const SPONSOR_PRIVATE_KEY = process.env.SPONSOR_PRIVATE_KEY;

export async function voteBySignatureApi({
  signature,
  proposalId,
  support,
}: {
  signature: `0x${string}`;
  proposalId: string;
  support: number;
}): Promise<`0x${string}`> {
  const request = await prepareVoteBySignatureApi({
    signature,
    proposalId,
    support,
  });

  const { governor } = Tenant.current().contracts;
  const transport = getTransportForChain(governor.chain.id)!;

  const walletClient = createWalletClient({
    chain: governor.chain,
    transport,
  });

  return walletClient.writeContract(request);
}

async function prepareVoteBySignatureApi({
  signature,
  proposalId,
  support,
}: {
  signature: `0x${string}`;
  proposalId: string;
  support: number;
}) {
  if (!SPONSOR_PRIVATE_KEY || !isHex(SPONSOR_PRIVATE_KEY)) {
    throw new Error("incorrect or missing SPONSOR_PRIVATE_KEY");
  }

  const { governor } = Tenant.current().contracts;

  const publicClient = getPublicClient();

  const { r, s, v } = parseSignature(signature);

  if (!v) {
    throw new Error("Unsupported signature type");
  }

  const account = privateKeyToAccount(SPONSOR_PRIVATE_KEY);

  const { request } = await publicClient.simulateContract({
    address: governor.address as `0x${string}`,
    abi: governor.abi,
    functionName: "castVoteBySig",
    args: [BigInt(proposalId), support, v, r, s],
    account: account,
  });

  return request;
}
