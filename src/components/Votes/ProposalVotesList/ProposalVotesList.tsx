"use client";

import InfiniteScroll from "react-infinite-scroller";
import { useAccount } from "wagmi";
import { ProposalSingleVote } from "./ProposalSingleVote";
import { Vote, VoterTypes } from "@/app/api/common/votes/vote";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchProposalVotes,
  fetchUserVotesForProposal,
} from "@/app/proposals/actions";
import { PaginatedResult } from "@/app/lib/pagination";
import { useProposalVotes } from "@/hooks/useProposalVotes";
import { VotesSort, VotesSortOrder } from "@/app/api/common/votes/vote";

interface Props {
  proposalId: string;
  offchainProposalId?: string;
  sort?: VotesSort;
  sortOrder?: VotesSortOrder;
  voterType?: string;
}

const LIMIT = 10;

export default function ProposalVotesList({
  proposalId,
  offchainProposalId,
  sort = "weight",
  sortOrder = "desc",
  voterType = "ALL",
}: Props) {
  const { data: fetchedVotes, isFetched } = useProposalVotes({
    enabled: true,
    limit: LIMIT,
    offset: 0,
    proposalId: proposalId,
    offchainProposalId,
    sort,
    sortOrder,
    voterType,
  });

  const { address: connectedAddress } = useAccount();
  const fetching = useRef(false);

  const [voteState, setVoteState] = useState<{
    pages: PaginatedResult<Vote[]>[];
    meta: PaginatedResult<Vote[]>["meta"] | undefined;
  }>({
    pages: [],
    meta: undefined,
  });

  const [userVotes, setUserVotes] = useState<Vote[]>([]);

  const fetchUserVoteAndSet = useCallback(
    async (proposalId: string, address: string) => {
      let fetchedUserVotes: Vote[];
      try {
        fetchedUserVotes = await fetchUserVotesForProposal(proposalId, address);
      } catch (error) {
        fetchedUserVotes = [];
      }
      setUserVotes(fetchedUserVotes);
    },
    []
  );

  // Set the initial votes list
  useEffect(() => {
    if (isFetched && fetchedVotes) {
      setVoteState({
        pages: [fetchedVotes],
        meta: fetchedVotes.meta,
      });
    }
  }, [fetchedVotes, isFetched, sort, sortOrder, voterType]); // Reset on sort/filter change

  useEffect(() => {
    if (connectedAddress) {
      fetchUserVoteAndSet(proposalId, connectedAddress);
    } else {
      setUserVotes([]);
    }
  }, [connectedAddress, fetchUserVoteAndSet, proposalId]);

  const proposalVotes = voteState.pages.flatMap((page) => page.data);

  // Only hide a vote from the general list if it is already shown in userVotes
  const userVoteAddressSet = useMemo(
    () => new Set(userVotes.map((v) => v.address)),
    [userVotes]
  );

  const loadMore = useCallback(async () => {
    if (!fetching.current && voteState.meta?.has_next) {
      fetching.current = true;
      const data = await fetchProposalVotes(
        proposalId,
        {
          limit: LIMIT,
          offset: voteState.meta.next_offset,
        },
        sort,
        offchainProposalId,
        sortOrder,
        voterType
      );
      setVoteState((prev) => ({
        pages: [...prev.pages, { ...data, votes: data.data }],
        meta: data.meta,
      }));
      fetching.current = false;
    }
  }, [
    proposalId,
    voteState.meta,
    sort,
    sortOrder,
    voterType,
    offchainProposalId,
  ]);

  return (
    <div className="px-4 pb-4 overflow-y-auto min-h-[36px] max-h-[calc(100vh-437px)]">
      {isFetched && fetchedVotes ? (
        <InfiniteScroll
          hasMore={voteState.meta?.has_next}
          pageStart={0}
          loadMore={loadMore}
          useWindow={false}
          loader={
            <div className="flex text-xs font-medium text-secondary" key={0}>
              Loading more votes...
            </div>
          }
          element="main"
        >
          <ul className="flex flex-col">
            {userVotes.map((vote) => (
              <li key={vote.transactionHash || vote.address + vote.citizenType}>
                <ProposalSingleVote vote={vote} />
              </li>
            ))}
            {proposalVotes.map((vote) => (
              <li
                key={vote.transactionHash || vote.address + vote.citizenType}
                className={`${userVoteAddressSet.has(vote.address) ? "hidden" : ""}`}
              >
                <ProposalSingleVote vote={vote} />
              </li>
            ))}
            {userVotes.length === 0 && proposalVotes.length === 0 && (
              <div className="px-4 pb-4 text-center text-secondary text-xs">
                No votes yet
              </div>
            )}
          </ul>
        </InfiniteScroll>
      ) : (
        <div className="text-secondary text-xs">Loading...</div>
      )}
    </div>
  );
}
