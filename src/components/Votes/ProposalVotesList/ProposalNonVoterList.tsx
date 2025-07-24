"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PaginatedResult } from "@/app/lib/pagination";
import { fetchVotersWhoHaveNotVotedForProposal } from "@/app/proposals/actions";
import InfiniteScroll from "react-infinite-scroller";
import { useProposalNonVotes } from "@/hooks/useProposalNonVotes";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { ParsedProposalData } from "@/lib/proposalUtils";
import { Vote, VoterTypes } from "@/app/api/common/votes/vote";
import { ProposalSingleNonVoter } from "./ProposalSingleNonVoter";
import ProposalVoterListFilter from "./ProsalVoterListFilter";
import { VOTER_TYPES } from "@/lib/constants";

const LIMIT = 20;

type ProposalNonVoterListProps = {
  proposal: Proposal;
  offchainProposalId?: string;
};

type ProposalNonVoterListContentProps = {
  proposal: Proposal;
  offchainProposalId?: string;
  selectedVoterType: VoterTypes;
};

const isApprovalProposal = (proposal: Proposal) => {
  return proposal.proposalType?.includes("APPROVAL");
};

// Child component that handles the actual voter list for a specific voter type
const ProposalNonVoterListContent = ({
  proposal,
  offchainProposalId,
  selectedVoterType,
}: ProposalNonVoterListContentProps) => {
  const { data: fetchedNonVotes, isFetched } = useProposalNonVotes({
    enabled: true,
    limit: LIMIT,
    offset: 0,
    proposalId: proposal.id,
    offchainProposalId,
    type: selectedVoterType.type,
  });

  const fetching = useRef(false);
  const [pages, setPages] = useState<PaginatedResult<any[]>[]>([]);
  const [meta, setMeta] = useState<PaginatedResult<Vote[]>["meta"]>();

  useEffect(() => {
    if (isFetched && fetchedNonVotes) {
      setPages([fetchedNonVotes]);
      setMeta(fetchedNonVotes.meta);
    }
  }, [fetchedNonVotes, isFetched]);

  const loadMore = useCallback(async () => {
    if (!fetching.current && meta?.has_next) {
      fetching.current = true;
      const voterTypeAtRequest = selectedVoterType.type;
      const data = await fetchVotersWhoHaveNotVotedForProposal(
        proposal.id,
        {
          limit: LIMIT,
          offset: meta.next_offset,
        },
        offchainProposalId,
        voterTypeAtRequest
      );

      if (selectedVoterType.type === voterTypeAtRequest) {
        setPages((prev) => [...prev, { ...data, votes: data.data }]);
        setMeta(data.meta);
      }
      fetching.current = false;
    }
  }, [proposal, meta, selectedVoterType, offchainProposalId]);

  const voters = useMemo(() => {
    return pages.flatMap((page) => page.data);
  }, [pages]);

  const isThresholdCriteria =
    isApprovalProposal(proposal) &&
    (proposal.proposalData as ParsedProposalData["APPROVAL"]["kind"])
      .proposalSettings?.criteria === "THRESHOLD";

  // Calculate max height
  let baseHeight = 437;
  if (isThresholdCriteria || proposal.proposalType === "SNAPSHOT") {
    baseHeight = 560;
  } else if (isApprovalProposal(proposal)) {
    baseHeight = 527;
  }

  // Only add 50px for offchainProposalId to account for filter
  if (offchainProposalId) {
    baseHeight += 50;
  }

  return (
    <div
      className="px-4 pb-4 overflow-y-auto min-h-[36px]"
      style={{ maxHeight: `calc(100vh - ${baseHeight}px)` }}
    >
      {isFetched && fetchedNonVotes ? (
        <InfiniteScroll
          hasMore={meta?.has_next}
          pageStart={0}
          loadMore={loadMore}
          useWindow={false}
          loader={
            <div className="flex text-xs font-medium text-secondary" key={0}>
              Loading more voters...
            </div>
          }
          element="main"
        >
          <ul className="flex flex-col gap-2">
            {voters.map((voter) => (
              <li key={voter.delegate} className="">
                <ProposalSingleNonVoter voter={voter} proposal={proposal} />
              </li>
            ))}
          </ul>
        </InfiniteScroll>
      ) : (
        <div className="text-secondary text-xs">Loading...</div>
      )}
    </div>
  );
};

export const ProposalNonVoterList = ({
  proposal,
  offchainProposalId,
}: ProposalNonVoterListProps) => {
  const [selectedVoterType, setSelectedVoterType] = useState<VoterTypes>(
    proposal.proposalType?.includes("HYBRID") ||
      proposal.proposalType?.includes("OFFCHAIN")
      ? VOTER_TYPES[0]
      : VOTER_TYPES[VOTER_TYPES.length - 1]
  );

  return (
    <>
      {offchainProposalId && (
        <ProposalVoterListFilter
          selectedVoterType={selectedVoterType}
          onVoterTypeChange={setSelectedVoterType}
        />
      )}
      <ProposalNonVoterListContent
        key={selectedVoterType.type}
        proposal={proposal}
        offchainProposalId={offchainProposalId}
        selectedVoterType={selectedVoterType}
      />
    </>
  );
};

export default ProposalNonVoterList;
