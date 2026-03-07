import { useQuery } from "@tanstack/react-query";

import { getSafeOwnersAndThreshold } from "@/lib/safeMessages";

export const SAFE_OWNERS_AND_THRESHOLD_QK = "safeOwnersAndThreshold";

export function useSafeOwnersAndThreshold({
  safeAddress,
  chainId,
  enabled = true,
}: {
  safeAddress?: `0x${string}`;
  chainId?: number;
  enabled?: boolean;
}) {
  return useQuery({
    enabled: enabled && Boolean(safeAddress) && Boolean(chainId),
    queryKey: [SAFE_OWNERS_AND_THRESHOLD_QK, safeAddress, chainId],
    queryFn: async () =>
      getSafeOwnersAndThreshold({
        safeAddress: safeAddress!,
        chainId: chainId!,
      }),
  });
}
