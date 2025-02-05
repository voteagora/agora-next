"use client";

import InfiniteScroll from "react-infinite-scroller";
import { useAccount } from "wagmi";
import { ProposalSingleVote } from "./ProposalSingleVote";
import { Vote } from "@/app/api/common/votes/vote";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchProposalVotes,
  fetchUserVotesForProposal,
} from "@/app/proposals/actions";
import { PaginatedResult } from "@/app/lib/pagination";
import { useProposalVotes } from "@/hooks/useProposalVotes";

interface Props {
  proposalId: string;
}

const LIMIT = 10;

export default function ProposalVotesList({ proposalId }: Props) {
  const { data: fetchedVotes, isFetched } = useProposalVotes({
    enabled: true,
    limit: LIMIT,
    offset: 0,
    proposalId: proposalId,
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
  }, [fetchedVotes, isFetched]);

  useEffect(() => {
    if (connectedAddress) {
      fetchUserVoteAndSet(proposalId, connectedAddress);
    } else {
      setUserVotes([]);
    }
  }, [connectedAddress, fetchUserVoteAndSet, proposalId]);

  const proposalVotes = voteState.pages.flatMap((page) => page.data);

  const loadMore = useCallback(async () => {
    if (!fetching.current && voteState.meta?.has_next) {
      fetching.current = true;
      const data = await fetchProposalVotes(proposalId, {
        limit: LIMIT,
        offset: voteState.meta.next_offset,
      });
      setVoteState((prev) => ({
        pages: [...prev.pages, { ...data, votes: data.data }],
        meta: data.meta,
      }));
      fetching.current = false;
    }
  }, [proposalId, voteState.meta]);

  return (
    <div className="px-4 pb-4 overflow-y-scroll max-h-[calc(100vh-437px)]">
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
              <li key={vote.transactionHash}>
                <ProposalSingleVote vote={vote} />
              </li>
            ))}
            {proposalVotes.map((vote) => (
              <li
                key={vote.transactionHash}
                className={`${
                  connectedAddress?.toLowerCase() === vote.address && "hidden"
                }`}
              >
                <ProposalSingleVote vote={vote} />
              </li>
            ))}
          </ul>
        </InfiniteScroll>
      ) : (
        <div className="text-secondary text-xs">Loading...</div>
      )}
    </div>
  );
}
