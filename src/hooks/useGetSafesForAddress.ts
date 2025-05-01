import { useSafeApiKit } from "@/contexts/SafeApiKitContext";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

export const useGetSafesForAddress = (
  address?: `0x${string}`,
  enabled = true
) => {
  const { address: connectedAddress, isConnected } = useAccount();
  const ownerAddress = address || connectedAddress;
  const { safeApiKit } = useSafeApiKit();

  return useQuery({
    queryKey: ["safes", ownerAddress],
    queryFn: async () => {
      if (!ownerAddress) {
        throw new Error("No address provided");
      }

      try {
        const { safes } = await safeApiKit!.getSafesByOwner(ownerAddress);
        return safes as `0x${string}`[];
      } catch (error) {
        throw error;
      }
    },
    enabled: Boolean(ownerAddress) && enabled && isConnected,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
