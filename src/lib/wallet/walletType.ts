import type { Address, Hex } from "viem";
import { getChainById, getPublicClient } from "@/lib/viem";

export type WalletAccountType =
  | "eoa"
  | "eip7702-delegated-eoa"
  | "contract"
  | "unknown";

const EIP7702_DELEGATION_PREFIX = "0xef0100";
// "0x" + 0xef0100 (3 bytes) + 20-byte delegate address = 46 hex chars + prefix
const EIP7702_CODE_LENGTH = 48;

/**
 * Classifies an account from its bytecode. EIP-7702 delegated EOAs (e.g. a
 * Coinbase Wallet upgraded in place) keep their address and signing key, so
 * they behave like EOAs for our purposes.
 */
export function classifyBytecode(code?: Hex | null): WalletAccountType {
  if (!code || code === "0x") {
    return "eoa";
  }

  const normalized = code.toLowerCase();
  if (
    normalized.startsWith(EIP7702_DELEGATION_PREFIX) &&
    normalized.length === EIP7702_CODE_LENGTH
  ) {
    return "eip7702-delegated-eoa";
  }

  return "contract";
}

const CACHE_TTL_MS = 30_000;
const cache = new Map<string, { cachedAt: number; value: WalletAccountType }>();

export async function getWalletAccountType(
  address: Address,
  chainId?: number
): Promise<WalletAccountType> {
  const cacheKey = `${chainId ?? "default"}:${address.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.value;
  }

  const chain = typeof chainId === "number" ? getChainById(chainId) : undefined;
  if (typeof chainId === "number" && !chain) {
    return "unknown";
  }

  try {
    const publicClient = getPublicClient(chain || undefined);
    const code = await publicClient.getCode({ address });
    const value = classifyBytecode(code);
    cache.set(cacheKey, { cachedAt: Date.now(), value });
    return value;
  } catch {
    return "unknown";
  }
}
