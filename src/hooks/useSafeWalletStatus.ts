import { useQuery } from "@tanstack/react-query";

import { isSafeWallet } from "@/lib/utils";

export const SAFE_WALLET_STATUS_QK = "safeWalletStatus";
const SAFE_WALLET_STATUS_STALE_MS = 30_000;

export function useSafeWalletStatus({
  address,
  chainId,
  enabled = true,
}: {
  address?: `0x${string}`;
  chainId?: number;
  enabled?: boolean;
}) {
  return useQuery({
    enabled: enabled && Boolean(address) && Boolean(chainId),
    queryKey: [SAFE_WALLET_STATUS_QK, address, chainId],
    queryFn: async () => isSafeWallet(address!, chainId!),
    staleTime: SAFE_WALLET_STATUS_STALE_MS,
    retry: false,
  });
}
