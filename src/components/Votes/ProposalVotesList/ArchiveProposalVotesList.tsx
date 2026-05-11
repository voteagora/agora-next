"use client";

import { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useAccount } from "wagmi";
import { Proposal } from "@/app/api/common/proposals/proposal";
import type {
  VotesSort,
  VotesSortOrder,
  VoterTypes,
  Vote,
} from "@/app/api/common/votes/vote";
import { ProposalSingleVote } from "./ProposalSingleVote";
import type { ProposalType } from "@/lib/types";
import { useArchiveVotes } from "@/hooks/useArchiveProposalVotes";

const VOTE_ROW_ESTIMATE_PX = 56;

type ArchiveProposalVotesListProps = {
  proposal: Proposal;
  sort?: VotesSort;
  sortOrder?: VotesSortOrder;
  voterType?: VoterTypes["type"];
};

export default function ArchiveProposalVotesList({
  proposal,
  sort,
  sortOrder,
  voterType,
}: ArchiveProposalVotesListProps) {
  const { address: connectedAddress } = useAccount();
  const scrollParentRef = useRef<HTMLDivElement | null>(null);

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
    sort,
    sortOrder,
    voterType,
  });

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

  const listVotes = useMemo(() => {
    return [...userVotes, ...remainingVotes];
  }, [remainingVotes, userVotes]);

  const rowVirtualizer = useVirtualizer({
    count: listVotes.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => VOTE_ROW_ESTIMATE_PX,
    overscan: 8,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

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
      <div className="px-4 pb-4 min-h-[160px] text-secondary text-xs">
        No votes yet.
      </div>
    );
  }

  return (
    <div
      ref={scrollParentRef}
      className="px-4 pb-4 overflow-y-auto flex-1 min-h-0"
    >
      <div
        className="relative w-full"
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      >
        {virtualRows.map((virtualRow) => {
          const vote = listVotes[virtualRow.index];
          if (!vote) {
            return null;
          }

          return (
            <div
              key={
                vote.transactionHash ||
                `${vote.address}-${vote.support}-${vote.weight}-${virtualRow.index}`
              }
              ref={rowVirtualizer.measureElement}
              data-index={virtualRow.index}
              className="absolute left-0 top-0 w-full"
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              <ProposalSingleVote vote={vote} resolveEns={false} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
