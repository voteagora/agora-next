"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { useAccount } from "wagmi";
import { type Vote } from "@/app/api/common/votes/vote";
import ApprovalProposalSingleVote from "./ApprovalProposalSingleVote";
import { PaginatedResult, PaginationParams } from "@/app/lib/pagination";

type Props = {
  initialProposalVotes: PaginatedResult<Vote[]>;
  fetchVotesForProposal: (
    proposalId: string,
    pagintation: PaginationParams
  ) => Promise<PaginatedResult<Vote[]>>;
  fetchUserVotes: (proposalId: string, address: string) => Promise<Vote[]>;
  proposalId: string;
};

export default function ApprovalProposalVotesList({
  initialProposalVotes,
  fetchVotesForProposal,
  fetchUserVotes,
  proposalId,
}: Props) {
  const fetching = useRef(false);
  const [pages, setPages] = useState([initialProposalVotes] || []);
  const [meta, setMeta] = useState(initialProposalVotes.meta);
  const [userVotes, setUserVotes] = useState<Vote[]>([]);
  const { address: connectedAddress } = useAccount();

  const proposalVotes = pages.reduce(
    (all: Vote[], page) => all.concat(page.data),
    []
  );

  const loadMore = async () => {
    if (!fetching.current && meta.has_next) {
      fetching.current = true;
      const data = await fetchVotesForProposal(proposalId, {
        limit: 20,
        offset: meta.next_offset,
      });
      const existingIds = new Set(proposalVotes.map((v) => v.transactionHash));
      const uniqueVotes = data.data.filter(
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

  useEffect(() => {
    if (connectedAddress) {
      fetchUserVoteAndSet(proposalId, connectedAddress);
    } else {
      setUserVotes([]);
    }
  }, [connectedAddress, proposalId, fetchUserVotes, fetchUserVoteAndSet]);

  return (
    <div className={"overflow-y-scroll max-h-[calc(100vh-437px)]"}>
      <InfiniteScroll
        hasMore={meta.has_next}
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
