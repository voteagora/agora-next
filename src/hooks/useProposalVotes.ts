import { fetchProposalVotes } from "@/app/proposals/actions";

import { useQuery } from "@tanstack/react-query";
import { PaginatedResult } from "@/app/lib/pagination";
import { Vote } from "@/app/api/common/votes/vote";

interface Props {
  enabled: boolean;
  limit?: number;
  offset?: number;
  proposalId: string;
}

const QK = "votes";

export const useProposalVotes = ({
  enabled,
  limit,
  offset,
  proposalId,
}: Props) => {
  const { data, isFetching, isFetched } = useQuery({
    enabled: enabled,
    queryKey: [QK, proposalId, offset],
    queryFn: async () => {
      return (await fetchProposalVotes(proposalId, {
        limit: limit || 20,
        offset: offset || 0,
      })) as PaginatedResult<Vote[]>;
    },
    staleTime: 60000, // 1 minute cache
  });

  return { data, isFetching, isFetched, queryKey: QK };
};
