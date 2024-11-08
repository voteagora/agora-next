import Tenant from "@/lib/tenant/tenant";
import { cache } from "react";
import {
  createWalletClient,
  parseSignature,
  http,
  createPublicClient,
  isHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const SPONSOR_PRIVATE_KEY = process.env.NEXT_PUBLIC_SPONSOR_PRIVATE_KEY;

export async function voteBySignature({
  request,
}: {
  request: ReturnType<typeof prepareVoteBySignature> extends Promise<infer T>
    ? T
    : never;
}): Promise<`0x${string}`> {
  const { governor } = Tenant.current().contracts;
  const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID!;
  const hasAlchemy = governor.chain.rpcUrls?.alchemy;

  const transport = hasAlchemy
    ? `${governor.chain.rpcUrls.alchemy.http[0]}/${alchemyId}`
    : `${governor.chain.rpcUrls.default.http[0]}`;

  const walletClient = createWalletClient({
    chain: governor.chain,
    transport: http(transport),
  });

  return walletClient.writeContract(request);
}

export async function prepareVoteBySignature({
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

  const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID!;
  const hasAlchemy = governor.chain.rpcUrls?.alchemy;
  const transport = hasAlchemy
    ? `${governor.chain.rpcUrls.alchemy.http[0]}/${alchemyId}`
    : `${governor.chain.rpcUrls.default.http[0]}`;

  const publicClient = createPublicClient({
    chain: governor.chain,
    transport: http(transport),
  });

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
