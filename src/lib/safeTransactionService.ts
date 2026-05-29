import type { Address } from "viem";

import { assertSafeProposalFlowSupported } from "@/lib/safeChains";
import { getStoredSiweJwt } from "@/lib/siweSession";

export type SafeMessageConfirmation = {
  owner: `0x${string}`;
  signature?: `0x${string}`;
  submittedAt?: string;
};

export type SafeMessageStatus = {
  safeAddress: `0x${string}`;
  messageHash: `0x${string}`;
  confirmations: SafeMessageConfirmation[];
  signedOwners: `0x${string}`[];
};

export type SafeMessageStatusResult = {
  status: SafeMessageStatus | null;
  nextPollMs: number;
  rateLimited?: boolean;
};

export type SafeMultisigTransactionConfirmation = {
  owner: `0x${string}`;
  signature?: `0x${string}`;
  submittedAt?: string;
};

export type SafeMultisigTransactionStatus = {
  safeAddress: `0x${string}`;
  safeTxHash: `0x${string}`;
  confirmations: SafeMultisigTransactionConfirmation[];
  signedOwners: `0x${string}`[];
  threshold?: number;
  isExecuted: boolean | null;
  isSuccessful: boolean | null;
  transactionHash?: `0x${string}`;
};

export type SafeMultisigTransactionStatusApiResponse = {
  safe?: Address;
  safeTxHash?: `0x${string}`;
  confirmationsRequired?: number | string | null;
  isExecuted?: boolean | null;
  isSuccessful: boolean | null;
  transactionHash?: `0x${string}`;
  confirmations?: Array<{
    owner?: Address;
    signature?: `0x${string}`;
    signatureType?: string;
    submissionDate?: string;
    created?: string;
    modified?: string;
  }>;
};

export type SafeMultisigTransactionLookupResult = {
  found: boolean;
  status: SafeMultisigTransactionStatus | null;
  isSuccessful: boolean | null;
  transactionHash?: `0x${string}`;
  nextPollMs: number;
  rateLimited?: boolean;
  missingReason?: "indexing" | "removed";
};

export function encodeSafeMessageConfirmations(
  confirmations: SafeMessageConfirmation[]
): `0x${string}` {
  const encoded = confirmations
    .filter(
      (
        confirmation
      ): confirmation is SafeMessageConfirmation & {
        signature: `0x${string}`;
      } => Boolean(confirmation.signature)
    )
    .slice()
    .sort((left, right) => {
      const leftOwner = BigInt(left.owner.toLowerCase());
      const rightOwner = BigInt(right.owner.toLowerCase());

      if (leftOwner < rightOwner) {
        return -1;
      }

      if (leftOwner > rightOwner) {
        return 1;
      }

      return 0;
    })
    .map((confirmation) => confirmation.signature.slice(2))
    .join("");

  return `0x${encoded}` as `0x${string}`;
}

export type SafeMessageStatusApiResponse = {
  safe?: Address;
  messageHash?: `0x${string}`;
  confirmations?: Array<{
    owner?: Address;
    signature?: `0x${string}`;
    signatureType?: string;
    created?: string;
    modified?: string;
  }>;
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

function buildSafeMessageStatusUrl(
  chainId: number,
  messageHash: `0x${string}`,
  safeAddress?: `0x${string}`
) {
  const params = new URLSearchParams({
    chainId: String(chainId),
    messageHash,
  });
  if (safeAddress) {
    params.set("safeAddress", safeAddress);
  }

  return `/api/internal/safe/message-status?${params.toString()}`;
}

function buildSafeMultisigTransactionUrl(
  chainId: number,
  safeTxHash: `0x${string}`,
  options?: {
    safeAddress?: `0x${string}`;
    createdAt?: string | number;
  }
) {
  const params = new URLSearchParams({
    chainId: String(chainId),
    safeTxHash,
  });
  if (options?.safeAddress) {
    params.set("safeAddress", options.safeAddress);
  }
  if (typeof options?.createdAt !== "undefined") {
    params.set("createdAt", String(options.createdAt));
  }

  return `/api/internal/safe/multisig-transaction?${params.toString()}`;
}

export function normalizeSafeMessageStatusApiResponse(
  payload: SafeMessageStatusApiResponse | null,
  messageHash: `0x${string}`
): SafeMessageStatus {
  const confirmations = (payload?.confirmations ?? []).reduce<
    SafeMessageConfirmation[]
  >((allConfirmations, confirmation) => {
    if (!confirmation.owner) {
      return allConfirmations;
    }

    allConfirmations.push({
      owner: confirmation.owner.toLowerCase() as `0x${string}`,
      signature: confirmation.signature,
      submittedAt: confirmation.modified ?? confirmation.created,
    });

    return allConfirmations;
  }, []);

  const signedOwners = Array.from(
    new Set(confirmations.map((confirmation) => confirmation.owner))
  );

  return {
    safeAddress: (payload?.safe ?? "").toLowerCase() as `0x${string}`,
    messageHash,
    confirmations,
    signedOwners,
  };
}

export function normalizeSafeMultisigTransactionApiResponse(
  payload: SafeMultisigTransactionStatusApiResponse | null,
  safeTxHash: `0x${string}`
): SafeMultisigTransactionStatus {
  const confirmations = (payload?.confirmations ?? []).reduce<
    SafeMultisigTransactionConfirmation[]
  >((allConfirmations, confirmation) => {
    if (!confirmation.owner) {
      return allConfirmations;
    }

    allConfirmations.push({
      owner: confirmation.owner.toLowerCase() as `0x${string}`,
      signature: confirmation.signature,
      submittedAt:
        confirmation.submissionDate ??
        confirmation.modified ??
        confirmation.created,
    });

    return allConfirmations;
  }, []);

  const signedOwners = Array.from(
    new Set(confirmations.map((confirmation) => confirmation.owner))
  );
  const rawThreshold = payload?.confirmationsRequired;
  const normalizedThreshold =
    typeof rawThreshold === "number"
      ? rawThreshold
      : typeof rawThreshold === "string" && rawThreshold.length > 0
        ? Number(rawThreshold)
        : undefined;

  return {
    safeAddress: (payload?.safe ?? "").toLowerCase() as `0x${string}`,
    safeTxHash,
    confirmations,
    signedOwners,
    threshold:
      typeof normalizedThreshold === "number" &&
      Number.isFinite(normalizedThreshold)
        ? normalizedThreshold
        : undefined,
    isExecuted: payload?.isExecuted ?? null,
    isSuccessful: payload?.isSuccessful ?? null,
    transactionHash: payload?.transactionHash,
  };
}

export async function fetchSafeMessageStatus(
  chainId: number,
  messageHash: `0x${string}`,
  safeAddress: `0x${string}`,
  extraHeaders?: Record<string, string>
): Promise<SafeMessageStatusResult> {
  assertSafeProposalFlowSupported(chainId);

  const authHeaders = getSafeRouteAuthHeaders();
  const headers =
    authHeaders || extraHeaders
      ? {
          ...(authHeaders ?? {}),
          ...(extraHeaders ?? {}),
        }
      : undefined;
  const response = await fetch(
    buildSafeMessageStatusUrl(chainId, messageHash, safeAddress),
    {
      cache: "no-store",
      ...(headers ? { headers } : {}),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to load Safe message status (${response.status})`);
  }

  return (await response.json()) as SafeMessageStatusResult;
}

export async function fetchSafeMultisigTransactionStatus(
  chainId: number,
  safeTxHash: `0x${string}`,
  options?: {
    safeAddress?: `0x${string}`;
    createdAt?: string | number;
  }
): Promise<SafeMultisigTransactionLookupResult> {
  assertSafeProposalFlowSupported(chainId);

  const authHeaders = getSafeRouteAuthHeaders(options?.safeAddress);
  const url = buildSafeMultisigTransactionUrl(chainId, safeTxHash, options);
  let response = await fetch(url, {
    cache: "no-store",
    ...(authHeaders ? { headers: authHeaders } : {}),
  });

  if (authHeaders && (response.status === 401 || response.status === 403)) {
    response = await fetch(url, {
      cache: "no-store",
    });
  }

  if (!response.ok) {
    throw new Error(
      `Failed to load Safe multisig transaction (${response.status})`
    );
  }

  return (await response.json()) as SafeMultisigTransactionLookupResult;
}
