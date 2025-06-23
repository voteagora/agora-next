import { useQuery } from "@tanstack/react-query";
import { PaginatedResult } from "@/app/lib/pagination";
import { fetchVotersWhoHaveNotVotedForProposal } from "@/app/proposals/actions";

interface Props {
  enabled: boolean;
  limit?: number;
  offset?: number;
  proposalId: string;
  offchainProposalId?: string;
}

const QK = "nonvotes";

export const useProposalNonVotes = ({
  enabled,
  limit,
  offset,
  proposalId,
  offchainProposalId,
}: Props) => {
  const { data, isFetching, isFetched } = useQuery({
    enabled: enabled,
    queryKey: [QK, proposalId, offset],
    queryFn: async () => {
      return (await fetchVotersWhoHaveNotVotedForProposal(
        proposalId,
        {
          offset: offset || 0,
          limit: limit || 20,
        },
        offchainProposalId
      )) as PaginatedResult<any[]>;
    },
    staleTime: 30000, // 30 second cache
  });

  return { data, isFetching, isFetched, queryKey: QK };
};
