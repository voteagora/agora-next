import { useQuery } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";

export const useDepositorTotalStaked = (address?: string) => {
  const { contracts } = Tenant.current();
  const { data, isFetching, isFetched } = useQuery({
    enabled: !!address,
    queryKey: ["depositorTotalStaked", address],
    queryFn: async () => {
      return await contracts.staker!.contract.depositorTotalStaked(
        address as `0x${string}`
      );
    },
  });

  return { data, isFetching, isFetched };
};
