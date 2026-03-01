import { useQuery } from "@tanstack/react-query";
import { PaginatedResult } from "@/app/lib/pagination";
import { fetchVotersWhoHaveNotVotedForProposal } from "@/app/proposals/actions";
import {
  VoterTypes,
  VotesSort,
  VotesSortOrder,
} from "@/app/api/common/votes/vote";

interface Props {
  enabled: boolean;
  limit?: number;
  offset?: number;
  proposalId: string;
  offchainProposalId?: string;
  type?: VoterTypes["type"];
  sort?: VotesSort;
  sortOrder?: VotesSortOrder;
}

const QK = "nonvotes";

export const useProposalNonVotes = ({
  enabled,
  limit,
  offset,
  proposalId,
  offchainProposalId,
  type,
  sort,
  sortOrder,
}: Props) => {
  const { data, isFetching, isFetched } = useQuery({
    enabled: enabled,
    queryKey: [
      QK,
      proposalId,
      offset,
      type,
      offchainProposalId,
      sort,
      sortOrder,
    ],
    queryFn: async () => {
      return (await fetchVotersWhoHaveNotVotedForProposal(
        proposalId,
        {
          offset: offset || 0,
          limit: limit || 20,
        },
        offchainProposalId,
        type,
        sort,
        sortOrder
      )) as PaginatedResult<any[]>;
    },
    staleTime: 30000, // 30 second cache
  });

  return { data, isFetching, isFetched, queryKey: QK };
};
