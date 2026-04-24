"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { useAccount } from "wagmi";
import type { Vote, VotesSort, VotesSortOrder,  } from "@/app/api/common/votes/vote";
import ApprovalProposalSingleVote from "./ApprovalProposalSingleVote";
import { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import { useProposalVotes } from "@/hooks/useProposalVotes";
import { cn } from "@/lib/utils";

type Props = {
  fetchVotesForProposal: (
    proposalId: string,
    pagintation: PaginationParams,
    sort?: VotesSort,
    offchainProposalId?: string,
    sortOrder?: VotesSortOrder,
    voterType?: string
  ) => Promise<PaginatedResult<Vote[]>>;
  fetchUserVotes: (proposalId: string, address: string) => Promise<Vote[]>;
  proposalId: string;
  isThresholdCriteria: boolean;
  sort?: VotesSort;
  sortOrder?: VotesSortOrder;
  voterType?: string;
};

const LIMIT = 20;

export default function ApprovalProposalVotesList({
  fetchVotesForProposal,
  fetchUserVotes,
  proposalId,
  isThresholdCriteria,
  sort,
  sortOrder,
  voterType,
}: Props) {
  const { data: fetchedVotes, isFetched } = useProposalVotes({
    enabled: true,
    limit: LIMIT,
    offset: 0,
    proposalId,
    sort,
    sortOrder,
    voterType,
  });

  const fetching = useRef(false);

  const [pages, setPages] = useState<PaginatedResult<Vote[]>[]>([]);
  const [meta, setMeta] = useState<PaginatedResult<Vote[]>["meta"]>();

  const [userVotes, setUserVotes] = useState<Vote[]>([]);
  const { address: connectedAddress } = useAccount();

  const proposalVotes = pages.flatMap((page) => page.data);

  const loadMore = async () => {
    if (!fetching.current && meta?.has_next) {
      fetching.current = true;
      const data = await fetchVotesForProposal(
        proposalId,
        {
          limit: LIMIT,
          offset: meta.next_offset,
        },
        sort,
        undefined,
        sortOrder,
        voterType
      );
      const existingIds = new Set(proposalVotes.map((v) => v.transactionHash));
      const uniqueVotes = data?.data?.filter(
        (v) => !existingIds.has(v.transactionHash)
      );
      setPages((prev) => [...prev, { ...data, votes: uniqueVotes }]);
      setMeta(data.meta);
      fetching.current = false;
    }
  };

  const fetchUserVoteAndSet = useCallback(
    async (proposalId: string, address: string) => {
      let fetchedUserVotes: Vote[];
      try {
        fetchedUserVotes = await fetchUserVotes(proposalId, address);
      } catch (error) {
        fetchedUserVotes = [];
      }
      setUserVotes(fetchedUserVotes);
    },
    [fetchUserVotes]
  );

  // Set the initial votes list
  useEffect(() => {
    if (isFetched && fetchedVotes) {
      setPages([fetchedVotes]);
      setMeta(fetchedVotes.meta);
    }
  }, [fetchedVotes, isFetched]);

  useEffect(() => {
    if (connectedAddress) {
      fetchUserVoteAndSet(proposalId, connectedAddress);
    } else {
      setUserVotes([]);
    }
  }, [connectedAddress, proposalId, fetchUserVotes, fetchUserVoteAndSet]);

  return (
    <div className={cn("overflow-y-scroll min-h-[36px]", "flex-1 min-h-0")}>
      <InfiniteScroll
        hasMore={meta?.has_next}
        pageStart={1}
        loadMore={loadMore}
        useWindow={false}
        loader={
          <div
            className="flex text-xs font-medium text-secondary justify-center pb-2"
            key={0}
          >
            Loading more votes...
          </div>
        }
      >
        <ul className="flex flex-col divide-y">
          {userVotes.map((vote) => (
            <li key={vote.transactionHash} className={`p-4`}>
              <ApprovalProposalSingleVote vote={vote} />
            </li>
          ))}
          {proposalVotes.map((vote) => (
            <li
              key={vote.transactionHash}
              className={`p-4 ${
                connectedAddress?.toLowerCase() === vote.address && "hidden"
              }`}
            >
              <ApprovalProposalSingleVote vote={vote} />
            </li>
          ))}
        </ul>
      </InfiniteScroll>
    </div>
  );
}
