import { useQuery } from "@tanstack/react-query";
import { useSafeApiKit } from "@/contexts/SafeApiKitContext";

export const useGetSafeInfo = (safeAddress?: string | `0x${string}`) => {
  const { safeApiKit } = useSafeApiKit();

  return useQuery({
    queryKey: ["safeInfo", safeAddress],
    queryFn: async () => {
      try {
        const safeInfo = await safeApiKit!.getSafeInfo(safeAddress!);
        return safeInfo || null;
      } catch (error) {
        console.error("Error fetching Safe information:", error);
        return null;
      }
    },
    enabled: Boolean(safeAddress && safeApiKit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
