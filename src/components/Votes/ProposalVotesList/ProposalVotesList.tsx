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
import { PaginatedResultEx } from "@/app/lib/pagination";

export default function ProposalVotesList({
  initialProposalVotes,
  proposal_id,
}: {
  initialProposalVotes: PaginatedResultEx<Vote[]>;
  proposal_id: string;
}) {
  const { address: connectedAddress } = useAccount();
  const { advancedDelegators } = useConnectedDelegate();
  const fetching = useRef(false);
  const [pages, setPages] = useState([initialProposalVotes] || []);
  const [meta, setMeta] = useState(initialProposalVotes.meta);
  const [userVotes, setUserVotes] = useState<Vote[]>([]);

  const fetchUserVoteAndSet = useCallback(
    async (proposal_id: string, address: string) => {
      let fetchedUserVotes: Vote[];
      try {
        fetchedUserVotes = await fetchUserVotesForProposal(
          proposal_id,
          address
        );
      } catch (error) {
        fetchedUserVotes = [];
      }
      setUserVotes(fetchedUserVotes);
    },
    []
  );

  useEffect(() => {
    if (connectedAddress) {
      fetchUserVoteAndSet(proposal_id, connectedAddress);
    } else {
      setUserVotes([]);
    }
  }, [connectedAddress, fetchUserVoteAndSet, proposal_id]);

  const proposalVotes = pages.reduce(
    (all, page) => all.concat(page.data),
    [] as Vote[]
  );

  const loadMore = useCallback(async () => {
    if (!fetching.current && meta.has_next) {
      fetching.current = true;
      const data = await fetchProposalVotes(proposal_id, {
        limit: 20,
        offset: meta.next_offset,
      });
      setPages((prev) => [...prev, { ...data, votes: data.data }]);
      setMeta(data.meta);
      fetching.current = false;
    }
  }, [proposal_id, meta]);

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
