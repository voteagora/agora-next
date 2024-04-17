import { useQuery } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";

export const useTotalStaked = () => {
  const { contracts } = Tenant.current();
  const { data, isFetching, isFetched } = useQuery({
    enabled: true,
    queryKey: ["totalStaked"],
    queryFn: async () => {
      return await contracts.staker!.contract.totalStaked();
    },
  });

  return { data, isFetching, isFetched };
};
