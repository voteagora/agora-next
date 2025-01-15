import { useQuery } from "@tanstack/react-query";
import { PaginatedResult } from "@/app/lib/pagination";
import { fetchVotersWhoHaveNotVotedForProposal } from "@/app/proposals/actions";

interface Props {
  enabled: boolean;
  limit?: number;
  offset?: number;
  proposalId: string;
}

const QK = "nonvotes";

export const useProposalNonVotes = ({
  enabled,
  limit,
  offset,
  proposalId,
}: Props) => {
  const { data, isFetching, isFetched } = useQuery({
    enabled: enabled,
    queryKey: [QK, proposalId],
    queryFn: async () => {
      return (await fetchVotersWhoHaveNotVotedForProposal(proposalId, {
        offset: offset || 0,
        limit: limit || 20,
      })) as PaginatedResult<any[]>;
    },
    staleTime: 180000, // 3 minute cache
  });

  return { data, isFetching, isFetched, queryKey: QK };
};
