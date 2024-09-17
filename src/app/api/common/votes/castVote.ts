import Tenant from "@/lib/tenant/tenant";
import { cache } from "react";
import { createWalletClient, hexToSignature, http } from "viem";
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
    throw new Error("SPONSOR_PRIVATE_KEY not defined");
  }

  const { governor } = Tenant.current().contracts;

  const { contracts } = Tenant.current();
  const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID!;
  const hasAlchemy = contracts.token.chain.rpcUrls?.alchemy;

  const transport = hasAlchemy
    ? `${contracts.token.chain.rpcUrls.alchemy.http[0]}/${alchemyId}`
    : `${contracts.token.chain.rpcUrls.default.http[0]}`;

  const walletClient = createWalletClient({
    chain: contracts.token.chain,
    transport: http(transport),
  });

  const account = privateKeyToAccount(SPONSOR_PRIVATE_KEY as `0x${string}`);

  const { r, s, v } = hexToSignature(signature);

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
