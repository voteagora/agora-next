import { useQuery } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";

export const VOTABLE_SUPPLY_QK = "votableSupply";

export const useGetVotableSupply = () => {
  const { contracts } = Tenant.current();
  const address = contracts.token.address;

  const { data, isFetching, isFetched } = useQuery({
    enabled: !!address,
    queryKey: [VOTABLE_SUPPLY_QK, address],
    queryFn: async () => {
      try {
        // Fetch votable supply from the API endpoint
        const response = await fetch(`/api/common/votableSupply`);
        const data = await response.json();
        // If the response contains votable_supply property, use it
        const supplyValue = data?.votable_supply || data || "0";

        // Convert the string response to BigInt
        return supplyValue;
      } catch (error) {
        console.error("Error fetching votable supply:", error);
        return "0";
      }
    },
    staleTime: 60000, // 1 minute cache
  });

  return { data, isFetching, isFetched };
};
