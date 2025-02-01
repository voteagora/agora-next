import { useQuery } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";

export const REWARD_PER_TOKEN_QK = "rewardPerToken";

interface Props {
  enabled: true;
}

export const useRewardPerToken = ({ enabled }: Props) => {
  const { contracts } = Tenant.current();
  const { data, isFetching, isFetched } = useQuery({
    enabled: enabled,
    queryKey: [REWARD_PER_TOKEN_QK],
    queryFn: async () => {
      return await contracts.staker!.contract.rewardPerTokenAccumulated();
    },
    staleTime: 3600000, // 1 hour cache
  });
  return { data, isFetching, isFetched };
};
