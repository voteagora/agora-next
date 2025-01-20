import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchVoterStats } from "@/app/delegates/actions";
import { VoterStats } from "@/lib/types";
import { getPublicClient } from "@/lib/viem";

export const VOTER_STATS_QK = "voterStats";

interface Props {
  address?: string | `0x${string}` | undefined;
}

export const useVoterStats = ({
  address,
}: Props): UseQueryResult<VoterStats, Error> => {
  const publicClient = getPublicClient();

  return useQuery<VoterStats, Error>({
    enabled: !!address,
    queryKey: [VOTER_STATS_QK, address],
    queryFn: async () => {
      const blockNumber = await publicClient.getBlockNumber({
        cacheTime: 600000, // 10 minute cache
      });
      return await fetchVoterStats(address!, Number(blockNumber) || 0);
    },
    staleTime: 180000, // 3 minute cache
  });
};
