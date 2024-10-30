import { useQuery } from "@tanstack/react-query";
import { fetchVoterStats } from "@/app/delegates/actions";

export const useVotingStats = ({ address }: { address: `0x${string}` }) => {
  return useQuery({
    queryKey: ["voting-stats", address],
    queryFn: () => fetchVoterStats(address),
  });
};
