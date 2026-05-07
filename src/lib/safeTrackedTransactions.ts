import type { Address } from "viem";

import {
  assertSafeProposalFlowSupported,
  getSafeAppChainSegment,
} from "@/lib/safeChains";
import { getStoredSiweJwt } from "@/lib/siweSession";

export const SAFE_TRACKED_TRANSACTION_KINDS = ["publish_proposal"] as const;

export type SafeTrackedTransactionKind =
  (typeof SAFE_TRACKED_TRANSACTION_KINDS)[number];

export type SafeTrackedTransactionSummary = {
  kind: SafeTrackedTransactionKind;
  safeAddress: `0x${string}`;
  chainId: number;
  safeTxHash: `0x${string}`;
  createdAt: string;
};

export type CreateSafeTrackedTransactionRequest = {
  kind: SafeTrackedTransactionKind;
  safeAddress: `0x${string}`;
  chainId: number;
  safeTxHash: `0x${string}`;
};

export type DiscoverSafeTrackedTransactionRequest = {
  kind: SafeTrackedTransactionKind;
  safeAddress: `0x${string}`;
  chainId: number;
  to: `0x${string}`;
  data: `0x${string}`;
  createdAfter: number;
};

function getSafeRouteAuthHeaders(expectedAddress?: Address) {
  const jwt = getStoredSiweJwt(
    expectedAddress ? { expectedAddress } : undefined
  );
  if (!jwt) {
    return undefined;
  }

  return {
    Authorization: `Bearer ${jwt}`,
  };
}

async function postSafeTrackedRoute<T>(
  path: string,
  body: unknown,
  options?: {
    authHeaders?: Record<string, string>;
    extraHeaders?: Record<string, string>;
  }
): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...(options?.authHeaders ?? {}),
    ...(options?.extraHeaders ?? {}),
  };

  let response = await fetch(path, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (
    options?.authHeaders &&
    (response.status === 401 || response.status === 403)
  ) {
    response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(options?.extraHeaders ?? {}),
      },
      body: JSON.stringify(body),
    });
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(
      typeof payload?.message === "string"
        ? payload.message
        : `Failed to POST ${path}`
    );
  }

  return (await response.json()) as T;
}

export async function createSafeTrackedTransaction(
  input: CreateSafeTrackedTransactionRequest,
  extraHeaders?: Record<string, string>
): Promise<SafeTrackedTransactionSummary> {
  assertSafeProposalFlowSupported(input.chainId);

  const authHeaders = getSafeRouteAuthHeaders(input.safeAddress);
  const payload = await postSafeTrackedRoute<{
    transaction: SafeTrackedTransactionSummary;
  }>("/api/internal/safe/tracked-transactions", input, {
    authHeaders,
    extraHeaders,
  });
  return payload.transaction;
}

export async function discoverSafeTrackedTransaction(
  input: DiscoverSafeTrackedTransactionRequest,
  extraHeaders?: Record<string, string>
): Promise<{
  found: boolean;
  transaction?: SafeTrackedTransactionSummary;
}> {
  assertSafeProposalFlowSupported(input.chainId);

  const authHeaders = getSafeRouteAuthHeaders(input.safeAddress);
  return postSafeTrackedRoute<{
    found: boolean;
    transaction?: SafeTrackedTransactionSummary;
  }>("/api/internal/safe/tracked-transactions/discover", input, {
    authHeaders,
    extraHeaders,
  });
}

export async function fetchActiveSafeTrackedTransactions(
  safeAddress: Address,
  kind: SafeTrackedTransactionKind
): Promise<SafeTrackedTransactionSummary[]> {
  const authHeaders = getSafeRouteAuthHeaders(safeAddress);
  const params = new URLSearchParams({
    safeAddress,
    kind,
  });
  let response = await fetch(
    `/api/internal/safe/tracked-transactions?${params.toString()}`,
    {
      cache: "no-store",
      ...(authHeaders ? { headers: authHeaders } : {}),
    }
  );

  if (authHeaders && (response.status === 401 || response.status === 403)) {
    response = await fetch(
      `/api/internal/safe/tracked-transactions?${params.toString()}`,
      {
        cache: "no-store",
      }
    );
  }

  if (!response.ok) {
    throw new Error(
      `Failed to load active Safe transactions (${response.status})`
    );
  }

  const payload = (await response.json()) as {
    transactions: SafeTrackedTransactionSummary[];
  };
  return payload.transactions;
}

export function getSafeAppQueueUrl(params: {
  chainId: number;
  safeAddress: `0x${string}`;
}) {
  const chainSegment = getSafeAppChainSegment(params.chainId);
  if (!chainSegment) {
    return null;
  }

  return `https://app.safe.global/home?safe=${chainSegment}:${params.safeAddress}`;
}
