"use client";

import { useMemo } from "react";
import { useAccount } from "wagmi";
import { Proposal } from "@/app/api/common/proposals/proposal";
import type { SnapshotVote } from "@/app/api/common/votes/vote";
import CopelandProposalSingleVote from "./CopelandProposalSingleVote";
import type { ProposalType } from "@/lib/types";
import { useArchiveVotes } from "@/hooks/useArchiveProposalVotes";
import { useVisibleRows } from "@/hooks/useVisibleRows";
import { cn } from "@/lib/utils";
import { ParsedProposalData } from "@/lib/proposalUtils";

const VOTES_PAGE_SIZE = 20;

type ArchiveCopelandProposalVotesListProps = {
  proposal: Proposal;
};

export default function ArchiveCopelandProposalVotesList({
  proposal,
}: ArchiveCopelandProposalVotesListProps) {
  const { address: connectedAddress } = useAccount();

  const proposalType: ProposalType = proposal.proposalType ?? "SNAPSHOT";
  const choices =
    (proposal.proposalData as ParsedProposalData["SNAPSHOT"]["kind"])
      ?.choices ?? [];
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

  const normalizedVotes = useMemo(() => {
    return votes.map((vote): SnapshotVote => {
      // For Copeland votes, params contains the ranked choices
      const choiceLabels = vote.params?.map((idx) => choices[idx - 1]) ?? [];

      return {
        id: vote.transactionHash || `${vote.address}-${vote.blockNumber}`,
        address: vote.address,
        votingPower: Number(vote.weight),
        reason: vote.reason || "",
        choiceLabels,
        createdAt: vote.timestamp || new Date(),
        choice: "",
        title: "",
        voterMetadata: vote.voterMetadata,
      } satisfies SnapshotVote;
    });
  }, [choices, votes]);

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

  const { containerRef, handleScroll, visibleCount } = useVisibleRows({
    pageSize: VOTES_PAGE_SIZE,
    resetKey: [proposal.id, remainingVotes.length].join(":"),
    totalCount: remainingVotes.length,
  });

  const paginatedVotes = useMemo(() => {
    return remainingVotes.slice(0, visibleCount);
  }, [remainingVotes, visibleCount]);

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
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn("overflow-y-scroll flex-1 min-h-0")}
    >
      <ul className="flex flex-col divide-y">
        {userVotes.map((vote) => (
          <li key={vote.id} className="p-4">
            <CopelandProposalSingleVote vote={vote} resolveEns={false} />
          </li>
        ))}
        {paginatedVotes.map((vote) => (
          <li key={vote.id} className="p-4">
            <CopelandProposalSingleVote vote={vote} resolveEns={false} />
          </li>
        ))}
      </ul>
    </div>
  );
}
