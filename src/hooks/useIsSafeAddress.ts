import { useQuery } from "@tanstack/react-query";
import SafeApiKit from "@safe-global/api-kit";
import { isAddress, getAddress } from "ethers";

export function useIsSafeAddress(address: string | undefined, chainId: number) {
  return useQuery({
    queryKey: ["isSafeAddress", address, chainId],
    queryFn: async () => {
      if (!address) return false;

      if (!isAddress(address)) {
        return false;
      }

      const bigIntChainId = BigInt(chainId);
      const checksumAddress = getAddress(address);

      const safeApiKit = new SafeApiKit({
        chainId: bigIntChainId,
      });

      try {
        // Get Safe info for the address
        const safeInfo = await safeApiKit.getSafeInfo(checksumAddress);

        return !!safeInfo?.address;
      } catch (error) {
        // If there's an error (like 404 Not Found), the address is not a Safe
        console.log(`Error checking if ${address} is a Safe:`, error);
        return false;
      }
    },
    enabled: !!address,
    staleTime: Infinity,
  });
}
