import {
  fetchProposalVotes,
  fetchSnapshotProposalVotes,
  fetchUserVotesForProposal,
} from "@/app/proposals/actions";

import { useQuery } from "@tanstack/react-query";
import { PaginatedResult } from "@/app/lib/pagination";
import { SnapshotVote, Vote } from "@/app/api/common/votes/vote";

interface Props {
  enabled: boolean;
  limit?: number;
  offset?: number;
  proposalId: string;
  offchainProposalId?: string;
}

const QK = "votes";

export const useProposalVotes = ({
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
      return (await fetchProposalVotes(
        proposalId,
        {
          limit: limit || 20,
          offset: offset || 0,
        },
        undefined,
        offchainProposalId
      )) as PaginatedResult<Vote[]>;
    },
    staleTime: 60000, // 1 minute cache
  });

  return { data, isFetching, isFetched, queryKey: QK };
};

export const useSnapshotProposalVotes = ({
  enabled,
  limit,
  offset,
  proposalId,
}: Props) => {
  const { data, isFetching, isFetched } = useQuery({
    enabled: enabled,
    queryKey: [QK, proposalId, offset],
    queryFn: async () => {
      return (await fetchSnapshotProposalVotes(proposalId, {
        limit: limit || 20,
        offset: offset || 0,
      })) as PaginatedResult<SnapshotVote[]>;
    },
    staleTime: 60000, // 1 minute cache
  });

  return { data, isFetching, isFetched, queryKey: QK };
};

import { Proposal } from "@/app/api/common/proposals/proposal";

export const useUserVotes = ({
  proposalId,
  address,
  proposal,
}: {
  proposalId: string;
  address: string | `0x${string}` | undefined;
  proposal?: Proposal;
}) => {
  const { data, isFetching, isFetched } = useQuery({
    enabled: !!address && !!proposalId,
    queryKey: ["userVotes", proposalId, address],
    queryFn: async () => {
      if (!address) return [];
      return await fetchUserVotesForProposal(proposalId, address, proposal);
    },
    staleTime: 60000,
  });

  return {
    votes: data || [],
    isLoading: isFetching,
    isFetched,
    hasVoted: (data?.length || 0) > 0,
  };
};
