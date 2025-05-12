import { useQuery } from "@tanstack/react-query";
import { useSafeApiKit } from "@/contexts/SafeApiKitContext";

type UseGetSafeInfoOptions = {
  safeAddress?: string;
  enabled?: boolean;
};

/**
 * Custom hook for fetching Safe wallet information using TanStack Query
 * @param options - Options for the query
 * @returns Query result with Safe wallet information
 */
export const useGetSafeInfo = ({
  safeAddress,
  enabled = true,
}: UseGetSafeInfoOptions) => {
  const { safeApiKit } = useSafeApiKit();

  return useQuery({
    queryKey: ["safeInfo", safeAddress],
    queryFn: async () => {
      if (!safeAddress) {
        throw new Error("Safe address is required");
      }

      if (!safeApiKit) {
        throw new Error("Safe API Kit is not initialized");
      }

      try {
        const safeInfo = await safeApiKit.getSafeInfo(safeAddress);
        return safeInfo;
      } catch (error) {
        console.error("Error fetching Safe information:", error);
        throw error;
      }
    },
    enabled: Boolean(safeAddress && safeApiKit && enabled),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
