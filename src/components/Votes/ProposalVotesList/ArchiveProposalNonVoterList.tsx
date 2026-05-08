"use client";

import { useCallback, useEffect, useMemo, useRef, type UIEvent } from "react";
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
const SCROLL_FETCH_THRESHOLD_PX = 360;

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
  const {
    nonVoters,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useArchiveNonVoters({
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

  const rowCount = hasNextPage
    ? filteredNonVoters.length + 1
    : filteredNonVoters.length;

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => NON_VOTER_ROW_ESTIMATE_PX,
    overscan: 8,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  const loadNextPageIfScrolledNearBottom = useCallback(
    (element: HTMLDivElement | null) => {
      if (!element || !hasNextPage || isFetchingNextPage) {
        return;
      }

      if (element.scrollHeight <= element.clientHeight) {
        return;
      }

      const distanceFromBottom =
        element.scrollHeight - element.scrollTop - element.clientHeight;

      if (distanceFromBottom <= SCROLL_FETCH_THRESHOLD_PX) {
        void fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  const handleScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      loadNextPageIfScrolledNearBottom(event.currentTarget);
    },
    [loadNextPageIfScrolledNearBottom]
  );

  useEffect(() => {
    if (
      scrollParentRef.current &&
      scrollParentRef.current.scrollTop > 0 &&
      filteredNonVoters.length
    ) {
      loadNextPageIfScrolledNearBottom(scrollParentRef.current);
    }
  }, [
    filteredNonVoters.length,
    loadNextPageIfScrolledNearBottom,
  ]);

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
        onScroll={handleScroll}
        className="px-4 pb-4 overflow-y-auto flex-1 min-h-0"
      >
        <div
          className="relative w-full"
          style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
        >
          {virtualRows.map((virtualRow) => {
            const nonVoter = filteredNonVoters[virtualRow.index];
            const isLoaderRow = virtualRow.index > filteredNonVoters.length - 1;

            if (isLoaderRow) {
              return (
                <div
                  key="archive-non-voter-loader"
                  className="absolute left-0 top-0 w-full py-2 text-xs text-secondary"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  {hasNextPage ? "Loading more non-voters..." : null}
                </div>
              );
            }

            if (!nonVoter) {
              return null;
            }

            return (
              <div
                key={`${nonVoter.delegate}-${nonVoter.citizen_type ?? "TH"}`}
                data-index={virtualRow.index}
                className="absolute left-0 top-0 w-full"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                <ProposalSingleNonVoter
                  voter={nonVoter}
                  proposal={proposal}
                  resolveEns={false}
                />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
