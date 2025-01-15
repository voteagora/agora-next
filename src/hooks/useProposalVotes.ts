import { fetchProposalVotes } from "@/app/proposals/actions";

import { useQuery } from "@tanstack/react-query";
import { PaginatedResult } from "@/app/lib/pagination";
import { Vote } from "@/app/api/common/votes/vote";

interface Props {
  proposalId: string;
  limit?: number;
  offset?: number;
  enabled: boolean;
}

const QK = "votes";

export const useProposalVotes = ({
  proposalId,
  limit,
  offset,
  enabled,
}: Props) => {
  const { data, isFetching, isFetched } = useQuery({
    enabled: enabled,
    queryKey: [QK, proposalId, offset],
    queryFn: async () => {
      return (await fetchProposalVotes(proposalId, {
        limit: limit || 250,
        offset: offset || 0,
      })) as PaginatedResult<Vote[]>;
    },
    staleTime: 60000, // 1 minute cache
  });

  return { data, isFetching, isFetched, queryKey: QK };
};
