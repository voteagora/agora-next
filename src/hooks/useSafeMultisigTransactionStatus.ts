import { useQuery } from "@tanstack/react-query";

import { isSafeOnchainTransactionTrackingEnabled } from "@/lib/safeFeatures";
import { fetchSafeMultisigTransactionStatus } from "@/lib/safeTransactionService";

export const SAFE_MULTISIG_TRANSACTION_STATUS_QK =
  "safeMultisigTransactionStatus";
const DEFAULT_SAFE_MULTISIG_POLL_MS = 5_000;

export function useSafeMultisigTransactionStatus({
  chainId,
  safeTxHash,
  safeAddress,
  createdAt,
  enabled = true,
}: {
  chainId?: number;
  safeTxHash?: `0x${string}`;
  safeAddress?: `0x${string}`;
  createdAt?: string;
  enabled?: boolean;
}) {
  const safeOnchainTrackingEnabled = isSafeOnchainTransactionTrackingEnabled();

  return useQuery({
    enabled:
      enabled &&
      safeOnchainTrackingEnabled &&
      Boolean(chainId) &&
      Boolean(safeTxHash),
    queryKey: [
      SAFE_MULTISIG_TRANSACTION_STATUS_QK,
      chainId,
      safeTxHash,
      safeAddress,
      createdAt,
    ],
    queryFn: async () =>
      fetchSafeMultisigTransactionStatus(chainId!, safeTxHash!, {
        safeAddress,
        createdAt,
      }),
    refetchInterval: enabled
      ? (query) =>
          query.state.data?.isSuccessful === null &&
          query.state.data?.missingReason !== "removed"
            ? (query.state.data?.nextPollMs ?? DEFAULT_SAFE_MULTISIG_POLL_MS)
            : false
      : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
