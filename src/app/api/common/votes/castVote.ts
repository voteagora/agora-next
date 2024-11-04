import Tenant from "@/lib/tenant/tenant";
import { getWalletClient } from "@/lib/viem";
import { cache } from "react";
import { parseSignature } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const SPONSOR_PRIVATE_KEY = process.env.NEXT_PUBLIC_SPONSOR_PRIVATE_KEY;

async function voteBySignature({
  signature,
  proposalId,
  support,
}: {
  signature: `0x${string}`;
  proposalId: string;
  support: number;
}): Promise<`0x${string}`> {
  if (!SPONSOR_PRIVATE_KEY) {
    throw new Error("SPONSOR_PRIVATE_KEY is not defined");
  }

  const account = privateKeyToAccount(SPONSOR_PRIVATE_KEY as `0x${string}`);

  const { governor } = Tenant.current().contracts;
  const walletClient = getWalletClient(governor.chain.id);

  const { r, s, v } = parseSignature(signature);

  if (!v) {
    throw new Error("Unsupported signature type");
  }

  const voteTx = await walletClient.writeContract({
    address: governor.address as `0x${string}`,
    abi: governor.abi,
    functionName: "castVoteBySig",
    args: [BigInt(proposalId), support, v, r, s],
    account: account,
  });

  return voteTx;
}

export const voteBySiganatureApi = cache(voteBySignature);
