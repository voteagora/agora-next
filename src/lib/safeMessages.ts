import type { Address } from "viem";
import {
  concatHex,
  encodeAbiParameters,
  hashMessage,
  keccak256,
  stringToHex,
} from "viem";

import { getChainById, getPublicClient } from "@/lib/viem";

const SAFE_DOMAIN_SEPARATOR_ABI = [
  {
    type: "function",
    name: "domainSeparator",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bytes32" }],
  },
] as const;

const SAFE_MESSAGE_TYPEHASH = keccak256(
  stringToHex("SafeMessage(bytes message)")
);

const safeDomainSeparatorCache = new Map<string, `0x${string}`>();

type GetCanonicalSafeMessageHashParams = {
  safeAddress: Address;
  chainId: number;
  message: string;
};

async function getSafeDomainSeparator({
  safeAddress,
  chainId,
}: Pick<GetCanonicalSafeMessageHashParams, "safeAddress" | "chainId">) {
  const cacheKey = `${chainId}:${safeAddress.toLowerCase()}`;
  const cached = safeDomainSeparatorCache.get(cacheKey);
  if (cached) return cached;

  const chain = getChainById(chainId);
  if (!chain) {
    throw new Error(`Unsupported Safe chain: ${chainId}`);
  }

  const publicClient = getPublicClient(chain);
  const domainSeparator = await publicClient.readContract({
    address: safeAddress,
    abi: SAFE_DOMAIN_SEPARATOR_ABI,
    functionName: "domainSeparator",
  });

  safeDomainSeparatorCache.set(cacheKey, domainSeparator);
  return domainSeparator;
}

export async function getCanonicalSafeMessageHash({
  safeAddress,
  chainId,
  message,
}: GetCanonicalSafeMessageHashParams) {
  const domainSeparator = await getSafeDomainSeparator({ safeAddress, chainId });
  const dataHash = hashMessage(message);
  const encodedDataHash = encodeAbiParameters(
    [{ type: "bytes32" }],
    [dataHash]
  );
  const safeMessageStructHash = keccak256(
    encodeAbiParameters(
      [
        { type: "bytes32" },
        { type: "bytes32" },
      ],
      [SAFE_MESSAGE_TYPEHASH, keccak256(encodedDataHash)]
    )
  );

  return keccak256(
    concatHex(["0x1901", domainSeparator, safeMessageStructHash])
  );
}
