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
const SAFE_DOMAIN_SEPARATOR_CACHE_MAX_ENTRIES = 500;
const SAFE_OWNERS_AND_THRESHOLD_CACHE_MAX_ENTRIES = 500;

const safeDomainSeparatorCache = new Map<string, `0x${string}`>();

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

export const SAFE_OWNERS_AND_THRESHOLD_CACHE_TTL_MS = 30_000;

const safeOwnersAndThresholdCache = new Map<
  string,
  {
    cachedAt: number;
    owners: `0x${string}`[];
    threshold: number;
  }
>();

function setBoundedCacheEntry<T>(
  cache: Map<string, T>,
  key: string,
  value: T,
  maxEntries: number
) {
  if (cache.has(key)) {
    cache.delete(key);
  }
  cache.set(key, value);

  while (cache.size > maxEntries) {
    const oldestKey = cache.keys().next().value;
    if (!oldestKey) {
      break;
    }
    cache.delete(oldestKey);
  }
}

type SafeSettingsRpcClient = {
  request?: unknown;
};

function isUnsupportedSafeSettingsError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("safe_setsettings") ||
    message.includes("method not found") ||
    message.includes("unsupported method") ||
    message.includes("unsupported request") ||
    message.includes("does not exist") ||
    message.includes("not implemented")
  );
}

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
  if (cached) {
    return cached;
  }

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

  setBoundedCacheEntry(
    safeDomainSeparatorCache,
    cacheKey,
    domainSeparator,
    SAFE_DOMAIN_SEPARATOR_CACHE_MAX_ENTRIES
  );
  return domainSeparator;
}

export async function getSafeOwnersAndThreshold(params: {
  safeAddress: Address;
  chainId: number;
}) {
  const cacheKey = `${params.chainId}:${params.safeAddress.toLowerCase()}`;
  const now = Date.now();
  for (const [existingKey, value] of safeOwnersAndThresholdCache.entries()) {
    if (now - value.cachedAt >= SAFE_OWNERS_AND_THRESHOLD_CACHE_TTL_MS) {
      safeOwnersAndThresholdCache.delete(existingKey);
    }
  }
  const cached = safeOwnersAndThresholdCache.get(cacheKey);
  if (cached && now - cached.cachedAt < SAFE_OWNERS_AND_THRESHOLD_CACHE_TTL_MS) {
    return {
      owners: cached.owners,
      threshold: cached.threshold,
    };
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
  setBoundedCacheEntry(
    safeOwnersAndThresholdCache,
    cacheKey,
    {
      ...result,
      cachedAt: now,
    },
    SAFE_OWNERS_AND_THRESHOLD_CACHE_MAX_ENTRIES
  );
  return result;
}

export async function getCanonicalSafeMessageHash({
  safeAddress,
  chainId,
  message,
}: GetCanonicalSafeMessageHashParams) {
  const domainSeparator = await getSafeDomainSeparator({
    safeAddress,
    chainId,
  });
  const dataHash = hashMessage(message);
  const encodedDataHash = encodeAbiParameters(
    [{ type: "bytes32" }],
    [dataHash]
  );
  const safeMessageStructHash = keccak256(
    encodeAbiParameters(
      [{ type: "bytes32" }, { type: "bytes32" }],
      [SAFE_MESSAGE_TYPEHASH, keccak256(encodedDataHash)]
    )
  );

  return keccak256(
    concatHex(["0x1901", domainSeparator, safeMessageStructHash])
  );
}

export async function ensureSafeOffchainSigningEnabled(
  walletClient: SafeSettingsRpcClient | null | undefined
) {
  if (!walletClient || typeof walletClient.request !== "function") {
    return "unavailable" as const;
  }

  try {
    await (
      walletClient.request as (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>
    )({
      method: "safe_setSettings",
      params: [{ offChainSigning: true }],
    });
    return "enabled" as const;
  } catch (error) {
    if (isUnsupportedSafeSettingsError(error)) {
      return "unsupported" as const;
    }

    throw error;
  }
}
