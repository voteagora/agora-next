import { useQuery } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";

export const TOTAL_STAKED_QK = "tokenBalance";

interface Props {
  enabled: true;
}

export const useTotalStaked = ({ enabled }: Props) => {
  const { contracts } = Tenant.current();
  const { data, isFetching, isFetched } = useQuery({
    enabled: enabled,
    queryKey: [TOTAL_STAKED_QK],
    queryFn: async () => {
      return await contracts.staker!.contract.totalStaked();
    },
    staleTime: 180000, // 3 minute cache
  });
  return { data, isFetching, isFetched };
};
