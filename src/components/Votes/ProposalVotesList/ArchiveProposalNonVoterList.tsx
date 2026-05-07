"use client";

import { useMemo } from "react";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { ProposalSingleNonVoter } from "./ProposalSingleNonVoter";
import { useArchiveNonVoters } from "@/hooks/useArchiveProposalVotes";
import { useVisibleRows } from "@/hooks/useVisibleRows";
import type {
  VotesSort,
  VotesSortOrder,
  VoterTypes,
} from "@/app/api/common/votes/vote";

const NON_VOTERS_PAGE_SIZE = 20;

type ArchiveProposalNonVoterListProps = {
  proposal: Proposal;
  selectedVoterType: VoterTypes;
  sort?: VotesSort;
  sortOrder?: VotesSortOrder;
};

export default function ArchiveProposalNonVoterList({
  proposal,
  selectedVoterType,
  sort,
  sortOrder,
}: ArchiveProposalNonVoterListProps) {
  const { nonVoters, isLoading, error } = useArchiveNonVoters({
    proposalId: proposal.id,
    sort,
    sortOrder,
    voterType: selectedVoterType.type,
  });

  // Determine if we should show the filter (logic kept for filtering data, though UI is lifted)
  const shouldShowFilter =
    proposal.proposalType?.includes("HYBRID") ||
    proposal.proposalType?.includes("OFFCHAIN") ||
    !!proposal.offchainProposalId;

  // Filter non-voters by citizen type
  const filteredNonVoters = useMemo(() => {
    if (!shouldShowFilter || !selectedVoterType) {
      return nonVoters;
    }

    return nonVoters.filter((nonVoter) => {
      const citizenType = nonVoter.citizen_type?.toUpperCase();
      const selectedType = selectedVoterType.type.toUpperCase();

      if (selectedType === "ALL") {
        return true;
      }

      // Token House: show non-voters without citizen type
      if (selectedType === "TH" && !citizenType) {
        return true;
      }

      // Map citizen types to voter types
      if (selectedType === "CHAIN" && citizenType === "CHAIN") {
        return true;
      }
      if (selectedType === "APP" && citizenType === "APP") {
        return true;
      }
      if (selectedType === "USER" && citizenType === "USER") {
        return true;
      }

      return false;
    });
  }, [nonVoters, selectedVoterType, shouldShowFilter]);

  const { containerRef, handleScroll, visibleCount } = useVisibleRows({
    pageSize: NON_VOTERS_PAGE_SIZE,
    resetKey: [
      proposal.id,
      selectedVoterType.type,
      sort ?? "weight",
      sortOrder ?? "desc",
      filteredNonVoters.length,
    ].join(":"),
    totalCount: filteredNonVoters.length,
  });

  const paginatedNonVoters = useMemo(() => {
    return filteredNonVoters.slice(0, visibleCount);
  }, [filteredNonVoters, visibleCount]);

  if (isLoading) {
    return (
      <div className="px-4 pb-4 text-secondary text-xs">
        Loading non-voters...
      </div>
    );
  }

  if (error) {
    return <div className="px-4 pb-4 text-secondary text-xs">{error}</div>;
  }

  if (!nonVoters.length) {
    return (
      <div className="px-4 pb-4 text-secondary text-xs">
        No non-voters data available.
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="px-4 pb-4 overflow-y-auto flex-1 min-h-0"
      >
        <ul className="flex flex-col gap-2">
          {paginatedNonVoters.map((nonVoter) => (
            <li key={nonVoter.delegate}>
              <ProposalSingleNonVoter voter={nonVoter} proposal={proposal} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
