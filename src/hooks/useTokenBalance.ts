import { useQuery, useQueryClient } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";
import { DEPOSITOR_TOTAL_STAKED_QK } from "@/hooks/useDepositorTotalStaked";

export const TOKEN_BALANCE_QK = "tokenBalance";

export const useTokenBalance = (address?: string) => {
  const { contracts } = Tenant.current();
  const { data, isFetching, isFetched } = useQuery({
    enabled: !!address,
    queryKey: [TOKEN_BALANCE_QK, address],
    queryFn: async () => {
      return await contracts.token.contract.balanceOf(address as `0x${string}`);
    },
  });
  return { data, isFetching, isFetched };
};
