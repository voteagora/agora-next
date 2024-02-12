"use client";

import InfiniteScroll from "react-infinite-scroller";
import styles from "./proposalVotesList.module.scss";
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

export default function ProposalVotesList({
  initialProposalVotes,
  proposal_id,
}: {
  initialProposalVotes: {
    meta: {
      currentPage: number;
      pageSize: number;
      hasNextPage: boolean;
    };
    votes: Vote[];
  };
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

  const proposalVotes = pages.reduce(
    (all, page) => all.concat(page.votes),
    [] as Vote[]
  );

  const loadMore = useCallback(
    async (page: number) => {
      if (!fetching.current && meta.hasNextPage) {
        fetching.current = true;
        const data = await fetchProposalVotes(proposal_id, page);
        const existingIds = new Set(
          proposalVotes.map((v) => v.transactionHash)
        );
        const uniqueVotes = data.votes.filter(
          (v) => !existingIds.has(v.transactionHash)
        );
        setPages((prev) => [...prev, { ...data, votes: uniqueVotes }]);
        setMeta(data.meta);
        fetching.current = false;
      }
    },
    [proposal_id, meta, proposalVotes]
  );

  const { isAdvancedUser } = useIsAdvancedUser();

  useEffect(() => {
    if (connectedAddress) {
      fetchUserVoteAndSet(proposal_id, connectedAddress);
    } else {
      setUserVotes([]);
    }
  }, [connectedAddress, fetchUserVoteAndSet, proposal_id]);

  return (
    <div className={styles.vote_container}>
      {/* @ts-ignore */}
      <InfiniteScroll
        hasMore={meta.hasNextPage}
        pageStart={1}
        loadMore={loadMore}
        useWindow={false}
        loader={
          <div className="flex text-xs font-medium text-stone-500" key={0}>
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
