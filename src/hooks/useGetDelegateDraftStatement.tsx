import { useQuery } from "@tanstack/react-query";
import { fetchDelegateDraftStatements } from "@/app/delegates/actions";

export const useGetDelegateDraftStatement = (
  address?: string | `0x${string}`
) => {
  return useQuery({
    queryKey: ["draftStatement", address],
    queryFn: async () => {
      if (!address) return null;
      const statement = await fetchDelegateDraftStatements(
        address.toLowerCase()
      );
      return statement?.[0] || null;
    },
    enabled: Boolean(address),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
