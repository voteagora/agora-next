import { useQuery } from "@tanstack/react-query";
import { ChartVote } from "@/lib/types";

interface Props {
  enabled: boolean;
  proposalId: string;
}

const QK = "votesChart";

export const useProposalVotesChart = ({ proposalId, enabled }: Props) => {
  const { data, isFetching, isFetched } = useQuery({
    enabled: enabled,
    queryKey: [QK, proposalId],
    queryFn: async (): Promise<ChartVote[]> => {
      const response = await fetch(`/api/proposals/${proposalId}/chart`);
      return (await response.json()) as Promise<ChartVote[]>;
    },
  });

  return { data, isFetching, isFetched, queryKey: QK };
};
