import {
  createSafeTrackedTransaction,
  type SafeTrackedTransactionSummary,
} from "@/lib/safeTrackedTransactions";

export function buildLocalSafePublishSummary(params: {
  safeAddress: `0x${string}`;
  chainId: number;
  safeTxHash: `0x${string}`;
  createdAt?: string;
}): SafeTrackedTransactionSummary {
  return {
    kind: "publish_proposal",
    safeAddress: params.safeAddress,
    chainId: params.chainId,
    safeTxHash: params.safeTxHash,
    createdAt: params.createdAt ?? new Date().toISOString(),
  };
}

export async function resolveSafePublishSummary(params: {
  discoveredPublish?: SafeTrackedTransactionSummary | null;
  safeAddress: `0x${string}`;
  chainId: number;
  safeTxHash: `0x${string}`;
  extraHeaders?: Record<string, string>;
}): Promise<{
  persisted: boolean;
  publish: SafeTrackedTransactionSummary;
}> {
  if (params.discoveredPublish) {
    return {
      persisted: true,
      publish: params.discoveredPublish,
    };
  }

  const fallbackPublish = buildLocalSafePublishSummary({
    safeAddress: params.safeAddress,
    chainId: params.chainId,
    safeTxHash: params.safeTxHash,
  });

  try {
    const publish = await createSafeTrackedTransaction(
      {
        kind: "publish_proposal",
        safeAddress: params.safeAddress,
        chainId: params.chainId,
        safeTxHash: params.safeTxHash,
      },
      params.extraHeaders
    );

    return {
      persisted: true,
      publish,
    };
  } catch {
    return {
      persisted: false,
      publish: fallbackPublish,
    };
  }
}
