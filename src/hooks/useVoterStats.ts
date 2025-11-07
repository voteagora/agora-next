import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  fetchDelegateStats,
  fetchVoterStats,
  fetchArchiveParticipation,
} from "@/app/delegates/actions";
import { VoterStats, DelegateResponse, DelegateStats } from "@/lib/types";
import { getPublicClient } from "@/lib/viem";
import Tenant from "@/lib/tenant/tenant";

export const VOTER_STATS_QK = "voterStats";
export const DELEGATE_STATS_QK = "participationStats";

const CACHE_TIME = 180000; // 3 minute cache

interface Props {
  address?: string | `0x${string}` | undefined;
}

export const useVoterStats = ({
  address,
}: Props): UseQueryResult<VoterStats, Error> => {
  const { contracts, ui } = Tenant.current();
  const publicClient = getPublicClient(
    ui.toggle("use-l1-block-number")?.enabled
      ? contracts.chainForTime
      : undefined
  );

  return useQuery<VoterStats, Error>({
    enabled: !!address,
    queryKey: [VOTER_STATS_QK, address],
    queryFn: async () => {
      // Intentionally caching the block number for 3 minutes to avoid
      // unnecessary requests. The tradeoff is that the most recent voting activity
      // won't be immediately reflected in the UI.
      let blockNumberOrTimestamp: number;
      if (ui.toggle("use-timestamp-for-proposal")?.enabled) {
        blockNumberOrTimestamp = Math.floor(Date.now() / 1000);
      } else {
        const blockNumber = await publicClient.getBlockNumber({
          cacheTime: CACHE_TIME,
        });
        blockNumberOrTimestamp = Number(blockNumber);
      }
      return await fetchVoterStats(address!, blockNumberOrTimestamp);
    },
    staleTime: CACHE_TIME,
  });
};

export const useDelegateStats = ({
  address,
}: Props): UseQueryResult<DelegateResponse | null, Error> => {
  return useQuery({
    enabled: !!address,
    queryKey: [DELEGATE_STATS_QK, address],
    queryFn: async () => {
      return await fetchDelegateStats(address!);
    },
    staleTime: CACHE_TIME,
  });
};

export const useArchiveParticipation = ({
  address,
  enabled = true,
}: Props & { enabled?: boolean }): UseQueryResult<
  {
    participated: number;
    totalProposals: number;
    rate: number;
  } | null,
  Error
> => {
  return useQuery({
    enabled: !!address && enabled,
    queryKey: [DELEGATE_STATS_QK, "archiveParticipation", address],
    queryFn: async () => {
      return await fetchArchiveParticipation(address!);
    },
    staleTime: CACHE_TIME,
  });
};
