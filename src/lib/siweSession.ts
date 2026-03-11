import { decodeJwt } from "jose";

import {
  LOCAL_STORAGE_SIWE_JWT_KEY,
  LOCAL_STORAGE_SIWE_STAGE_KEY,
} from "@/lib/constants";

type StoredJwtContainer = {
  access_token?: string;
};

type SiweJwtClaims = {
  siwe?: {
    address?: string;
    chainId?: string;
  };
  exp?: number;
};

export type StoredSiweSession = {
  token: string;
  address: `0x${string}`;
  chainId: number;
  exp?: number;
};

export function clearStoredSiweSession(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_SIWE_JWT_KEY);
    localStorage.removeItem(LOCAL_STORAGE_SIWE_STAGE_KEY);
  } catch {}
}

function readStoredJwtFromStorage(): string | null {
  if (typeof window === "undefined") return null;

  let raw: string | null = null;
  try {
    raw = localStorage.getItem(LOCAL_STORAGE_SIWE_JWT_KEY);
  } catch {
    return null;
  }

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredJwtContainer | null;
    const token =
      typeof parsed?.access_token === "string" && parsed.access_token.trim()
        ? parsed.access_token
        : null;
    if (!token) {
      clearStoredSiweSession();
      return null;
    }
    return token;
  } catch {
    clearStoredSiweSession();
    return null;
  }
}

function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

export function getStoredSiweSession(options?: {
  expectedAddress?: string;
}): StoredSiweSession | null {
  const token = readStoredJwtFromStorage();
  if (!token) return null;

  let decoded: SiweJwtClaims;
  try {
    decoded = decodeJwt(token) as SiweJwtClaims;
  } catch {
    clearStoredSiweSession();
    return null;
  }

  if (typeof decoded.exp !== "number") {
    clearStoredSiweSession();
    return null;
  }
  if (decoded.exp < Math.floor(Date.now() / 1000)) {
    clearStoredSiweSession();
    return null;
  }

  const siweAddress = decoded.siwe?.address;
  const siweChainId = decoded.siwe?.chainId;
  if (!siweAddress || !siweChainId) {
    clearStoredSiweSession();
    return null;
  }

  const normalized = normalizeAddress(siweAddress);
  if (options?.expectedAddress) {
    const expected = normalizeAddress(options.expectedAddress);
    if (expected !== normalized) {
      clearStoredSiweSession();
      return null;
    }
  }

  const chainId = Number(siweChainId);
  if (!Number.isFinite(chainId) || chainId <= 0) {
    clearStoredSiweSession();
    return null;
  }

  return {
    token,
    address: normalized as `0x${string}`,
    chainId,
    exp: decoded.exp,
  };
}

export function getStoredSiweJwt(options?: {
  expectedAddress?: string;
}): string | null {
  return getStoredSiweSession(options)?.token ?? null;
}

export async function waitForStoredSiweJwt(options?: {
  expectedAddress?: string;
  timeoutMs?: number;
  intervalMs?: number;
}): Promise<string | null> {
  const timeoutMs = options?.timeoutMs ?? 10_000;
  const intervalMs = options?.intervalMs ?? 200;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const token = getStoredSiweJwt({
      expectedAddress: options?.expectedAddress,
    });
    if (token) return token;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return null;
}
