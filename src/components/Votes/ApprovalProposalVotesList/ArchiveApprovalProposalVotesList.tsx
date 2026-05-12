"use client";

import { useMemo } from "react";
import { useAccount } from "wagmi";
import { Proposal } from "@/app/api/common/proposals/proposal";
import type {
  Vote,
  VotesSort,
  VotesSortOrder,
  VoterTypes,
} from "@/app/api/common/votes/vote";
import ApprovalProposalSingleVote from "./ApprovalProposalSingleVote";
import type { ProposalType } from "@/lib/types";
import { useArchiveVotes } from "@/hooks/useArchiveProposalVotes";
import { useVisibleRows } from "@/hooks/useVisibleRows";
import { cn } from "@/lib/utils";
import { ParsedProposalData } from "@/lib/proposalUtils";

const VOTES_PAGE_SIZE = 20;

type ArchiveApprovalProposalVotesListProps = {
  proposal: Proposal;
  isThresholdCriteria: boolean;
  sort?: VotesSort;
  sortOrder?: VotesSortOrder;
  voterType?: VoterTypes["type"];
};

export default function ArchiveApprovalProposalVotesList({
  proposal,
  isThresholdCriteria,
  sort,
  sortOrder,
  voterType,
}: ArchiveApprovalProposalVotesListProps) {
  const { address: connectedAddress } = useAccount();

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

  const approvalOptionLabels = useMemo(() => {
    if (!proposalType?.includes("APPROVAL") || !proposal.proposalData) {
      return [] as string[];
    }

    if (proposalType === "OFFCHAIN_APPROVAL") {
      const data =
        proposal.proposalData as ParsedProposalData["OFFCHAIN_APPROVAL"]["kind"];
      return data?.choices ?? [];
    }

    const data = proposal.proposalData as
      | ParsedProposalData["APPROVAL"]["kind"]
      | ParsedProposalData["HYBRID_APPROVAL"]["kind"];

    return (
      data?.options?.map((option) => option.description)?.filter(Boolean) ?? []
    );
  }, [proposal.proposalData, proposalType]);

  const normalizedVotes = useMemo(() => {
    return votes.map((vote): Vote => {
      const paramsAsLabels = (() => {
        if (!vote.params || !vote.params.length) {
          return [] as string[];
        }

        if (!approvalOptionLabels.length) {
          return vote.params.map((param) => param.toString());
        }

        return vote.params
          .map((paramIndex) => {
            const idx = Number(paramIndex);
            const label = approvalOptionLabels[idx];
            if (label) {
              return label;
            }
            if (Number.isFinite(idx)) {
              return idx.toString();
            }
            return null;
          })
          .filter((label): label is string => Boolean(label));
      })();

      return {
        transactionHash: vote.transactionHash,
        address: vote.address,
        proposalId: proposal.id,
        support: "FOR",
        weight: vote.weight,
        reason: vote.reason,
        params: paramsAsLabels,
        proposalValue: 0n,
        proposalTitle: proposal.markdowntitle,
        proposalType: vote.proposalType,
        timestamp: vote.timestamp,
        blockNumber: vote.blockNumber ?? undefined,
        citizenType: vote.citizenType,
        voterMetadata: vote.voterMetadata,
      } satisfies Vote;
    });
  }, [votes, proposal.id, proposal.markdowntitle, approvalOptionLabels]);

  const connectedAddressLower = connectedAddress?.toLowerCase();

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
    resetKey: [
      proposal.id,
      sort ?? "weight",
      sortOrder ?? "desc",
      voterType ?? "ALL",
      remainingVotes.length,
    ].join(":"),
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
      className={cn("overflow-y-scroll min-h-[36px]", "flex-1 min-h-0")}
    >
      <ul className="flex flex-col divide-y">
        {userVotes.map((vote) => (
          <li
            key={
              vote.transactionHash ||
              `${vote.address}-${vote.support}-${vote.weight}`
            }
            className="p-4"
          >
            <ApprovalProposalSingleVote vote={vote} resolveEns={false} />
          </li>
        ))}
        {paginatedVotes.map((vote) => (
          <li
            key={
              vote.transactionHash ||
              `${vote.address}-${vote.support}-${vote.weight}`
            }
            className="p-4"
          >
            <ApprovalProposalSingleVote vote={vote} resolveEns={false} />
          </li>
        ))}
      </ul>
    </div>
  );
}
