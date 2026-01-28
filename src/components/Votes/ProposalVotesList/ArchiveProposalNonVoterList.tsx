"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { ProposalSingleNonVoter } from "./ProposalSingleNonVoter";
import { useArchiveNonVoters } from "@/hooks/useArchiveProposalVotes";
import ProposalVoterListFilter from "./ProsalVoterListFilter";
import { VOTER_TYPES } from "@/lib/constants";
import { VoterTypes } from "@/app/api/common/votes/vote";

const NON_VOTERS_PAGE_SIZE = 20;

type ArchiveProposalNonVoterListProps = {
  proposal: Proposal;
  selectedVoterType: VoterTypes;
};

export default function ArchiveProposalNonVoterList({
  proposal,
  selectedVoterType,
}: ArchiveProposalNonVoterListProps) {
  const [visibleCount, setVisibleCount] = useState(NON_VOTERS_PAGE_SIZE);

  const { nonVoters, isLoading, error } = useArchiveNonVoters({
    proposalId: proposal.id,
  });

  useEffect(() => {
    setVisibleCount(NON_VOTERS_PAGE_SIZE);
  }, [selectedVoterType]);

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

  const paginatedNonVoters = useMemo(() => {
    return filteredNonVoters.slice(0, visibleCount);
  }, [filteredNonVoters, visibleCount]);

  const hasMore = visibleCount < filteredNonVoters.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) =>
      Math.min(prev + NON_VOTERS_PAGE_SIZE, filteredNonVoters.length)
    );
  }, [filteredNonVoters.length]);

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

  const isOffchain = proposal.proposalType?.includes("OFFCHAIN") ?? false;

  return (
    <>
      <div
        className="px-4 pb-4 overflow-y-auto min-h-[36px]"
        style={{
          maxHeight: "calc(100vh - 437px)",
        }}
      >
        <InfiniteScroll
          key={selectedVoterType.type}
          hasMore={hasMore}
          pageStart={0}
          loadMore={loadMore}
          useWindow={false}
          loader={
            <div className="flex text-xs font-medium text-secondary" key={0}>
              Loading ...
            </div>
          }
          element="main"
        >
          <ul className="flex flex-col gap-2">
            {paginatedNonVoters.map((nonVoter) => (
              <li key={nonVoter.delegate}>
                <ProposalSingleNonVoter voter={nonVoter} proposal={proposal} />
              </li>
            ))}
          </ul>
        </InfiniteScroll>
      </div>
    </>
  );
}
