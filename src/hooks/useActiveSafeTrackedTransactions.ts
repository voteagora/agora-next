import { useQuery } from "@tanstack/react-query";

import { isSafeOnchainTransactionTrackingEnabled } from "@/lib/safeFeatures";
import {
  fetchActiveSafeTrackedTransactions,
  type SafeTrackedTransactionKind,
} from "@/lib/safeTrackedTransactions";

export const ACTIVE_SAFE_TRACKED_TRANSACTIONS_QK =
  "activeSafeTrackedTransactions";
const DEFAULT_ACTIVE_SAFE_TRACKED_TRANSACTIONS_POLL_MS = 30_000;

export function useActiveSafeTrackedTransactions({
  kind,
  safeAddress,
  enabled = true,
}: {
  kind: SafeTrackedTransactionKind;
  safeAddress?: `0x${string}`;
  enabled?: boolean;
}) {
  const safeOnchainTrackingEnabled = isSafeOnchainTransactionTrackingEnabled();

  return useQuery({
    enabled: enabled && safeOnchainTrackingEnabled && Boolean(safeAddress),
    queryKey: [ACTIVE_SAFE_TRACKED_TRANSACTIONS_QK, safeAddress, kind],
    queryFn: async () => fetchActiveSafeTrackedTransactions(safeAddress!, kind),
    refetchInterval: enabled
      ? DEFAULT_ACTIVE_SAFE_TRACKED_TRANSACTIONS_POLL_MS
      : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
