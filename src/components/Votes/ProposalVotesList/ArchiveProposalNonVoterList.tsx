"use client";

import { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { ProposalSingleNonVoter } from "./ProposalSingleNonVoter";
import { useArchiveNonVoters } from "@/hooks/useArchiveProposalVotes";
import type {
  VotesSort,
  VotesSortOrder,
  VoterTypes,
} from "@/app/api/common/votes/vote";

const NON_VOTER_ROW_ESTIMATE_PX = 60;

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
  const scrollParentRef = useRef<HTMLDivElement | null>(null);
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

  const rowVirtualizer = useVirtualizer({
    count: filteredNonVoters.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => NON_VOTER_ROW_ESTIMATE_PX,
    overscan: 8,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

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
      <div className="px-4 pb-4 min-h-[160px] text-secondary text-xs">
        No non-voters data available.
      </div>
    );
  }

  if (!filteredNonVoters.length) {
    return (
      <div className="px-4 pb-4 min-h-[160px] text-secondary text-xs">
        No non-voters match this filter.
      </div>
    );
  }

  return (
    <>
      <div
        ref={scrollParentRef}
        className="px-4 pb-4 overflow-y-auto flex-1 min-h-0"
      >
        <div
          className="relative w-full"
          style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
        >
          {virtualRows.map((virtualRow) => {
            const nonVoter = filteredNonVoters[virtualRow.index];
            if (!nonVoter) {
              return null;
            }

            return (
              <div
                key={`${nonVoter.delegate}-${nonVoter.citizen_type ?? "TH"}`}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className="absolute left-0 top-0 w-full"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                <ProposalSingleNonVoter voter={nonVoter} proposal={proposal} />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
