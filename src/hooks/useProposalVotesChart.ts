import { useQuery } from "@tanstack/react-query";
import { ChartVote } from "@/lib/types";

const QK = "votesChart";
const CACHE_TIME = 60000; // 1 minute cache

interface Props {
  enabled: boolean;
  proposalId: string;
  proposalType?: string;
}

export const useProposalVotesChart = ({
  proposalId,
  enabled,
  proposalType,
}: Props) => {
  const { data, isFetching, isFetched } = useQuery({
    enabled: enabled,
    queryKey: [QK, proposalId, proposalType],
    queryFn: async (): Promise<ChartVote[]> => {
      const response = await fetch(
        `/api/proposals/${proposalId}/chart${proposalType === "SNAPSHOT" ? `?proposalType=${proposalType}` : ""}`
      );
      return (await response.json()) as Promise<ChartVote[]>;
    },
    staleTime: CACHE_TIME,
  });

  return { data, isFetching, isFetched, queryKey: QK };
};
