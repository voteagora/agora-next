import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import {
  getWalletAccountType,
  type WalletAccountType,
} from "@/lib/wallet/walletType";

export function useWalletAccountType(
  address: Address | undefined,
  chainId?: number
) {
  return useQuery<WalletAccountType>({
    enabled: !!address,
    queryKey: ["walletAccountType", chainId ?? "default", address],
    queryFn: async () => {
      if (!address) return "unknown";
      return getWalletAccountType(address, chainId);
    },
    staleTime: 60_000,
  });
}
