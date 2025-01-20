import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchVoterStats } from "@/app/delegates/actions";
import { VoterStats } from "@/lib/types";
import { getPublicClient } from "@/lib/viem";

export const VOTER_STATS_QK = "voterStats";

const CACHE_TIME = 180000; // 3 minute cache

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
      // Intentionally caching the block number for 3 minutes to avoid
      // unnecessary requests. The tradeoff is that the most recent voting activity
      // won't be immediately reflected in the UI.
      const blockNumber = await publicClient.getBlockNumber({
        cacheTime: CACHE_TIME,
      });
      return await fetchVoterStats(address!, Number(blockNumber) || 0);
    },
    staleTime: CACHE_TIME,
  });
};
