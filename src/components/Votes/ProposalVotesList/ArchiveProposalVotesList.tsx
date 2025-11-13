"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { useAccount } from "wagmi";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { Vote } from "@/app/api/common/votes/vote";
import { ProposalSingleVote } from "./ProposalSingleVote";
import type { ProposalType } from "@/lib/types";
import { useArchiveVotes } from "@/hooks/useArchiveProposalVotes";

const VOTES_PAGE_SIZE = 20;

type ArchiveProposalVotesListProps = {
  proposal: Proposal;
};

export default function ArchiveProposalVotesList({
  proposal,
}: ArchiveProposalVotesListProps) {
  const { address: connectedAddress } = useAccount();
  const [visibleCount, setVisibleCount] = useState(VOTES_PAGE_SIZE);

  const proposalType: ProposalType = proposal.proposalType ?? "STANDARD";

  let startBlock: bigint | number | null = null;
  if (proposal.startBlock !== null && proposal.startBlock !== undefined) {
    startBlock =
      typeof proposal.startBlock === "bigint"
        ? proposal.startBlock
        : BigInt(proposal.startBlock);
  } else if (proposal.snapshotBlockNumber) {
    startBlock = BigInt(proposal.snapshotBlockNumber);
  }

  const { votes, isLoading, error } = useArchiveVotes({
    proposalId: proposal.id,
    proposalType,
    startBlock,
  });

  useEffect(() => {
    setVisibleCount(VOTES_PAGE_SIZE);
  }, [votes.length]);

  const normalizedVotes = useMemo(() => {
    return votes.map(
      (vote): Vote => ({
        transactionHash: vote.transactionHash,
        address: vote.address,
        proposalId: proposal.id,
        support: vote.support,
        weight: vote.weight,
        reason: vote.reason,
        params: null,
        proposalValue: 0n,
        proposalTitle: proposal.markdowntitle,
        proposalType: vote.proposalType,
        timestamp: vote.timestamp,
        blockNumber: vote.blockNumber ?? undefined,
        citizenType: vote.citizenType,
        voterMetadata: vote.voterMetadata,
      })
    );
  }, [votes, proposal.id, proposal.markdowntitle]);

  const connectedAddressLower = useMemo(
    () => connectedAddress?.toLowerCase(),
    [connectedAddress]
  );

  const userVotes = useMemo(() => {
    if (!connectedAddressLower) {
      return [];
    }

    return normalizedVotes.filter(
      (vote) => vote.address === connectedAddressLower
    );
  }, [connectedAddressLower, normalizedVotes]);

  const userVoteAddressSet = useMemo(() => {
    return new Set(userVotes.map((vote) => vote.address));
  }, [userVotes]);

  const remainingVotes = useMemo(() => {
    return normalizedVotes.filter(
      (vote) => !userVoteAddressSet.has(vote.address)
    );
  }, [normalizedVotes, userVoteAddressSet]);

  const paginatedVotes = useMemo(() => {
    return remainingVotes.slice(0, visibleCount);
  }, [remainingVotes, visibleCount]);

  const hasMore = visibleCount < remainingVotes.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) =>
      Math.min(prev + VOTES_PAGE_SIZE, remainingVotes.length)
    );
  }, [remainingVotes.length]);

  if (isLoading) {
    return (
      <div className="px-4 pb-4 text-secondary text-xs">Loading votes...</div>
    );
  }

  if (error) {
    return <div className="px-4 pb-4 text-secondary text-xs">{error}</div>;
  }

  if (!normalizedVotes.length) {
    return (
      <div className="px-4 pb-4 text-secondary text-xs">No votes yet.</div>
    );
  }

  return (
    <div className="px-4 pb-4 overflow-y-auto min-h-[36px] max-h-[calc(100vh-437px)]">
      <InfiniteScroll
        hasMore={hasMore}
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
            <li
              key={
                vote.transactionHash ||
                `${vote.address}-${vote.support}-${vote.weight}`
              }
            >
              <ProposalSingleVote vote={vote} />
            </li>
          ))}
          {paginatedVotes.map((vote) => (
            <li
              key={
                vote.transactionHash ||
                `${vote.address}-${vote.support}-${vote.weight}`
              }
            >
              <ProposalSingleVote vote={vote} />
            </li>
          ))}
        </ul>
      </InfiniteScroll>
    </div>
  );
}
