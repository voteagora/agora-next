import { useQuery } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";

export const REWARD_DURATION_QK = "rewardPerToken";

interface Props {
  enabled: true;
}

export const useRewardDuration = ({ enabled }: Props) => {
  const { contracts } = Tenant.current();
  const { data, isFetching, isFetched } = useQuery({
    enabled: enabled,
    queryKey: [REWARD_DURATION_QK],
    queryFn: async () => {
      return await contracts.staker!.contract.REWARD_DURATION();
    },
    staleTime: 3600000, // 1 hour cache
  });
  return { data, isFetching, isFetched };
};
