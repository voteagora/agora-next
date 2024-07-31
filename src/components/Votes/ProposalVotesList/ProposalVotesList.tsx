"use client";

import InfiniteScroll from "react-infinite-scroller";
import useIsAdvancedUser from "@/app/lib/hooks/useIsAdvancedUser";
import { useAccount } from "wagmi";
import { ProposalSingleVote } from "./ProposalSingleVote";
import { Vote } from "@/app/api/common/votes/vote";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchProposalVotes,
  fetchUserVotesForProposal,
} from "@/app/proposals/actions";
import useConnectedDelegate from "@/hooks/useConnectedDelegate";
import { PaginatedResult } from "@/app/lib/pagination";

export default function ProposalVotesList({
  initialProposalVotes,
  proposalId,
}: {
  initialProposalVotes: PaginatedResult<Vote[]>;
  proposalId: string;
}) {
  const { address: connectedAddress } = useAccount();
  const { advancedDelegators } = useConnectedDelegate();
  const fetching = useRef(false);
  const [pages, setPages] = useState([initialProposalVotes] || []);
  const [meta, setMeta] = useState(initialProposalVotes.meta);
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

  useEffect(() => {
    if (connectedAddress) {
      fetchUserVoteAndSet(proposalId, connectedAddress);
    } else {
      setUserVotes([]);
    }
  }, [connectedAddress, fetchUserVoteAndSet, proposalId]);

  const proposalVotes = pages.reduce(
    (all, page) => all.concat(page.data),
    [] as Vote[]
  );

  const loadMore = useCallback(async () => {
    if (!fetching.current && meta.has_next) {
      fetching.current = true;
      const data = await fetchProposalVotes(proposalId, {
        limit: 20,
        offset: meta.next_offset,
      });
      setPages((prev) => [...prev, { ...data, votes: data.data }]);
      setMeta(data.meta);
      fetching.current = false;
    }
  }, [proposalId, meta]);

  const { isAdvancedUser } = useIsAdvancedUser();

  return (
    <div className="px-4 pb-4 overflow-y-scroll max-h-[calc(100vh-437px)]">
      <InfiniteScroll
        hasMore={meta.has_next}
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
              <ProposalSingleVote
                vote={vote}
                isAdvancedUser={isAdvancedUser}
                delegators={advancedDelegators}
              />
            </li>
          ))}
          {proposalVotes.map((vote) => (
            <li
              key={vote.transactionHash}
              className={`${
                connectedAddress?.toLowerCase() === vote.address && "hidden"
              }`}
            >
              <ProposalSingleVote
                vote={vote}
                isAdvancedUser={isAdvancedUser}
                delegators={advancedDelegators}
              />
            </li>
          ))}
        </ul>
      </InfiniteScroll>
    </div>
  );
}
