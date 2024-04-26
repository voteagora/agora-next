"use client";

import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { useAccount } from "wagmi";
import { type Vote } from "@/app/api/common/votes/vote";
import ApprovalProposalSingleVote from "./ApprovalProposalSingleVote";

type Props = {
  initialProposalVotes: {
    meta: {
      currentPage: number;
      pageSize: number;
      hasNextPage: boolean;
    };
    votes: Vote[];
  };
  fetchVotesForProposal: (
    proposal_id: string,
    page?: number
  ) => Promise<{
    meta: {
      currentPage: number;
      pageSize: number;
      hasNextPage: boolean;
    };
    votes: Vote[];
  }>;
  fetchUserVotes: (proposal_id: string, address: string) => Promise<Vote[]>;
  proposal_id: string;
};

export default function ApprovalProposalVotesList({
  initialProposalVotes,
  fetchVotesForProposal,
  fetchUserVotes,
  proposal_id,
}: Props) {
  const fetching = useRef(false);
  const [pages, setPages] = useState([initialProposalVotes] || []);
  const [meta, setMeta] = useState(initialProposalVotes.meta);
  const [userVotes, setUserVotes] = useState<Vote[]>([]);
  const { address: connectedAddress } = useAccount();

  const proposalVotes = pages.reduce(
    (all: Vote[], page) => all.concat(page.votes),
    []
  );

  const loadMore = async (page: number) => {
    if (!fetching.current && meta.hasNextPage) {
      fetching.current = true;
      const data = await fetchVotesForProposal(proposal_id, page);
      const existingIds = new Set(proposalVotes.map((v) => v.transactionHash));
      const uniqueVotes = data.votes.filter(
        (v) => !existingIds.has(v.transactionHash)
      );
      setPages((prev) => [...prev, { ...data, votes: uniqueVotes }]);
      setMeta(data.meta);
      fetching.current = false;
    }
  };

  const fetchUserVoteAndSet = async (proposal_id: string, address: string) => {
    let fetchedUserVotes: Vote[];
    try {
      fetchedUserVotes = await fetchUserVotes(proposal_id, address);
    } catch (error) {
      fetchedUserVotes = [];
    }
    setUserVotes(fetchedUserVotes);
  };

  useEffect(() => {
    if (connectedAddress) {
      fetchUserVoteAndSet(proposal_id, connectedAddress);
    } else {
      setUserVotes([]);
    }
  }, [connectedAddress, proposal_id]);

  return (
    <div className={"overflow-y-scroll max-h-[calc(100vh-437px)]"}>
      {/* @ts-ignore */}
      <InfiniteScroll
        hasMore={meta.hasNextPage}
        pageStart={1}
        loadMore={loadMore}
        useWindow={false}
        loader={
          <div
            className="flex text-xs font-medium text-stone-500 justify-center pb-2"
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
