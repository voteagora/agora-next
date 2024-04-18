import { useQuery } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";

export const useUnclaimedReward = (address: string | undefined) => {
  const { contracts } = Tenant.current();
  const { data, isFetching, isFetched } = useQuery({
    enabled: !!address,
    queryKey: ["unclaimedReward", address],
    queryFn: async () => {
      return await contracts.staker!.contract.unclaimedReward(address as `0x${string}`);
    },
  });

  return { data, isFetching, isFetched };
};
