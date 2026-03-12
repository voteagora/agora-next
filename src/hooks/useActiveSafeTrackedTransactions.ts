import { useQuery } from "@tanstack/react-query";

import {
  fetchActiveSafeTrackedTransactions,
  type SafeTrackedTransactionKind,
} from "@/lib/safeTrackedTransactions";

export const ACTIVE_SAFE_TRACKED_TRANSACTIONS_QK =
  "activeSafeTrackedTransactions";
const DEFAULT_ACTIVE_SAFE_TRACKED_TRANSACTIONS_POLL_MS = 10_000;

export function useActiveSafeTrackedTransactions({
  kind,
  safeAddress,
  enabled = true,
}: {
  kind: SafeTrackedTransactionKind;
  safeAddress?: `0x${string}`;
  enabled?: boolean;
}) {
  return useQuery({
    enabled: enabled && Boolean(safeAddress),
    queryKey: [ACTIVE_SAFE_TRACKED_TRANSACTIONS_QK, safeAddress, kind],
    queryFn: async () => fetchActiveSafeTrackedTransactions(safeAddress!, kind),
    refetchInterval: enabled
      ? DEFAULT_ACTIVE_SAFE_TRACKED_TRANSACTIONS_POLL_MS
      : false,
    refetchOnWindowFocus: true,
    retry: false,
  });
}
