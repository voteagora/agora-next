import { useQuery } from "@tanstack/react-query";
import { fetchVoterStats } from "@/app/delegates/actions";
import { useBlockNumber } from "wagmi";

export const useVotingStats = ({ address }: { address: `0x${string}` }) => {
  const { data: blockNumber } = useBlockNumber();

  return useQuery({
    // deliberately not including blockNumber in the query key
    // because we don't want to re-fetch on every block number
    queryKey: ["voting-stats", address],
    queryFn: () => fetchVoterStats(address, Number(blockNumber)),
    enabled: !!blockNumber,
  });
};
