import { useQuery } from "@tanstack/react-query";

import { fetchSafeMessageStatus } from "@/lib/safeTransactionService";

export const SAFE_MESSAGE_STATUS_QK = "safeMessageStatus";

export function useSafeMessageStatus({
  chainId,
  messageHash,
  enabled = true,
}: {
  chainId?: number;
  messageHash?: `0x${string}`;
  enabled?: boolean;
}) {
  return useQuery({
    enabled: enabled && Boolean(chainId) && Boolean(messageHash),
    queryKey: [SAFE_MESSAGE_STATUS_QK, chainId, messageHash],
    queryFn: async () => fetchSafeMessageStatus(chainId!, messageHash!),
    refetchInterval: enabled ? 3000 : false,
  });
}
