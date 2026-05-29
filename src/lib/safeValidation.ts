import { getAddress, isHex } from "viem";

import {
  SAFE_TRACKED_TRANSACTION_KINDS,
  type SafeTrackedTransactionKind,
} from "@/lib/safeTrackedTransactions";

function isFixedHexLength(value: string, byteLength: number) {
  return /^0x[0-9a-fA-F]+$/.test(value) && value.length === 2 + byteLength * 2;
}

export function normalizeSafeAddress(value: string): `0x${string}` | null {
  try {
    return getAddress(value);
  } catch {
    return null;
  }
}

export function normalizeSafeMessageHash(value: string): `0x${string}` | null {
  if (!isFixedHexLength(value, 32)) {
    return null;
  }

  return value.toLowerCase() as `0x${string}`;
}

export function normalizeSafeTxHash(value: string): `0x${string}` | null {
  if (!isFixedHexLength(value, 32)) {
    return null;
  }

  return value.toLowerCase() as `0x${string}`;
}

export function normalizeHexData(value: string): `0x${string}` | null {
  if (!isHex(value, { strict: true })) {
    return null;
  }

  return value.toLowerCase() as `0x${string}`;
}

export function normalizePositiveInteger(value: number | string) {
  const numericValue = typeof value === "number" ? value : Number(value);

  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    return null;
  }

  return numericValue;
}

export function isSafeTrackedTransactionKind(
  value: string
): value is SafeTrackedTransactionKind {
  return SAFE_TRACKED_TRANSACTION_KINDS.includes(
    value as SafeTrackedTransactionKind
  );
}
