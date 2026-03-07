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

const SAFE_OWNERS_AND_THRESHOLD_ABI = [
  {
    type: "function",
    name: "getOwners",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address[]" }],
  },
  {
    type: "function",
    name: "getThreshold",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const SAFE_MESSAGE_TYPEHASH = keccak256(
  stringToHex("SafeMessage(bytes message)")
);

const safeDomainSeparatorCache = new Map<string, `0x${string}`>();
const safeOwnersAndThresholdCache = new Map<
  string,
  {
    owners: `0x${string}`[];
    threshold: number;
  }
>();

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

export async function getSafeOwnersAndThreshold(params: {
  safeAddress: Address;
  chainId: number;
}) {
  const cacheKey = `${params.chainId}:${params.safeAddress.toLowerCase()}`;
  const cached = safeOwnersAndThresholdCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const chain = getChainById(params.chainId);
  if (!chain) {
    throw new Error(`Unsupported Safe chain: ${params.chainId}`);
  }

  const publicClient = getPublicClient(chain);
  const [owners, threshold] = await Promise.all([
    publicClient.readContract({
      address: params.safeAddress,
      abi: SAFE_OWNERS_AND_THRESHOLD_ABI,
      functionName: "getOwners",
    }),
    publicClient.readContract({
      address: params.safeAddress,
      abi: SAFE_OWNERS_AND_THRESHOLD_ABI,
      functionName: "getThreshold",
    }),
  ]);

  const result = {
    owners: owners.map((owner) => owner.toLowerCase() as `0x${string}`),
    threshold: Number(threshold),
  };
  safeOwnersAndThresholdCache.set(cacheKey, result);
  return result;
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
