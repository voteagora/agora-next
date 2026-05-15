import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { ProposalType } from "@/lib/types";
import type { ArchiveVoteRow } from "@/lib/archiveUtils";
import { parseSupport } from "@/lib/voteUtils";
import type {
  VotesSort,
  VotesSortOrder,
  VoterTypes,
} from "@/app/api/common/votes/vote";
import type { PaginatedResult } from "@/app/lib/pagination";
import Tenant from "@/lib/tenant/tenant";
import {
  canArchiveVotesSortByTime,
  processArchiveVotes,
  transformArchiveVoteRows,
  type ArchiveNonVoter,
  type ArchiveVote,
} from "@/lib/archiveVoteHistory";
export type { ArchiveNonVoter, ArchiveVote } from "@/lib/archiveVoteHistory";

const ARCHIVE_VOTES_QK = "archiveVotes";
const ARCHIVE_NON_VOTERS_QK = "archiveNonVoters";

const ARCHIVE_NON_VOTERS_PAGE_SIZE = 100;

/**
 * Fetch and transform archive votes
 */
async function fetchArchiveVotes({
  proposalId,
  proposalType,
  startBlock,
  signal,
}: {
  proposalId: string;
  proposalType: ProposalType;
  startBlock: bigint | number | null;
  signal?: AbortSignal;
}): Promise<ArchiveVote[]> {
  const response = await fetch(`/api/archive/votes/${proposalId}`, {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const payload = (await response.json()) as {
    data?: ArchiveVoteRow[];
  };

  return transformArchiveVoteRows(payload.data ?? [], {
    parseSupport,
    proposalId,
    proposalType,
    startBlock,
  });
}

export function useArchiveVotes({
  proposalId,
  proposalType,
  startBlock,
  sort = "weight", // Default to weight
  sortOrder = "desc", // Default to desc
  voterType = "ALL",
}: {
  proposalId: string;
  proposalType: ProposalType;
  startBlock: bigint | number | null;
  sort?: VotesSort;
  sortOrder?: VotesSortOrder;
  voterType?: VoterTypes["type"];
}) {
  const startBlockString =
    startBlock !== undefined && startBlock !== null
      ? typeof startBlock === "bigint"
        ? startBlock.toString()
        : String(startBlock)
      : null;

  const { data, isLoading, error } = useQuery({
    queryKey: [ARCHIVE_VOTES_QK, proposalId, proposalType, startBlockString],
    queryFn: ({ signal }) =>
      fetchArchiveVotes({ proposalId, proposalType, startBlock, signal }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  const processedVotes = useMemo(() => {
    if (!data) return [];

    return processArchiveVotes(data, {
      sort,
      sortOrder,
      voterType,
      tokenDecimals: Tenant.current().token.decimals,
    });
  }, [data, sort, sortOrder, voterType]);

  const canSortByTime = useMemo(() => {
    if (!processedVotes.length) {
      return false;
    }

    return canArchiveVotesSortByTime(processedVotes);
  }, [processedVotes]);

  return {
    votes: processedVotes,
    canSortByTime,
    isLoading,
    error: error ? (error as Error).message : null,
  };
}

/**
 * Fetch and transform archive non-voters
 */
async function fetchArchiveNonVoters({
  proposalId,
  sort,
  sortOrder,
  voterType,
  limit = ARCHIVE_NON_VOTERS_PAGE_SIZE,
  offset = 0,
  signal,
}: {
  proposalId: string;
  sort: VotesSort;
  sortOrder: VotesSortOrder;
  voterType: VoterTypes["type"];
  limit?: number;
  offset?: number;
  signal?: AbortSignal;
}): Promise<PaginatedResult<ArchiveNonVoter[]>> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    sort,
    sortOrder,
    voterType,
  });

  const response = await fetch(
    `/api/archive/non-voters/${proposalId}?${params}`,
    {
      cache: "no-store",
      signal,
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as PaginatedResult<ArchiveNonVoter[]>;
}

export function useArchiveNonVoters({
  proposalId,
  sort = "weight",
  sortOrder = "desc",
  voterType = "ALL",
}: {
  proposalId: string;
  sort?: VotesSort;
  sortOrder?: VotesSortOrder;
  voterType?: VoterTypes["type"];
}) {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [ARCHIVE_NON_VOTERS_QK, proposalId, sort, sortOrder, voterType],
    queryFn: ({ pageParam, signal }) =>
      fetchArchiveNonVoters({
        proposalId,
        sort,
        sortOrder,
        voterType,
        offset: pageParam,
        signal,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.meta.has_next ? lastPage.meta.next_offset : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  const processedNonVoters = useMemo(() => {
    if (!data) return [];

    return data.pages.flatMap((page) => page.data);
  }, [data]);

  return {
    nonVoters: processedNonVoters,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
