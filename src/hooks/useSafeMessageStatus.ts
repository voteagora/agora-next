import { useQuery } from "@tanstack/react-query";

import { fetchSafeMessageStatus } from "@/lib/safeTransactionService";

export const SAFE_MESSAGE_STATUS_QK = "safeMessageStatus";
const DEFAULT_SAFE_MESSAGE_STATUS_POLL_MS = 5_000;

export function useSafeMessageStatus({
  chainId,
  messageHash,
  safeAddress,
  enabled = true,
  getHeaders,
}: {
  chainId?: number;
  messageHash?: `0x${string}`;
  safeAddress?: `0x${string}`;
  enabled?: boolean;
  getHeaders?: () => Record<string, string>;
}) {
  return useQuery({
    enabled: enabled && Boolean(chainId) && Boolean(messageHash) && Boolean(safeAddress),
    queryKey: [SAFE_MESSAGE_STATUS_QK, chainId, messageHash, safeAddress],
    queryFn: async () =>
      fetchSafeMessageStatus(
        chainId!,
        messageHash!,
        safeAddress!,
        getHeaders?.()
      ),
    refetchInterval: enabled
      ? (query) =>
          query.state.data?.nextPollMs ?? DEFAULT_SAFE_MESSAGE_STATUS_POLL_MS
      : false,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
