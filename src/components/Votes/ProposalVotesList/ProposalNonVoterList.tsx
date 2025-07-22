"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PaginatedResult } from "@/app/lib/pagination";
import { fetchVotersWhoHaveNotVotedForProposal } from "@/app/proposals/actions";
import InfiniteScroll from "react-infinite-scroller";
import { ProposalSingleNonVoter } from "./ProposalSingleNonVoter";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { useProposalNonVotes } from "@/hooks/useProposalNonVotes";
import { Vote, VoterTypes } from "@/app/api/common/votes/vote";
import { cn } from "@/lib/utils";
import { ParsedProposalData } from "@/lib/proposalUtils";
import { VOTER_TYPES } from "@/lib/constants";
import ProposalVoterListFilter from "./ProsalVoterListFilter";
const LIMIT = 20;

type Props = {
  proposal: Proposal;
  isApprovalProposal?: boolean;
  offchainProposalId?: string;
};

const ProposalNonVoterList = ({
  proposal,
  isApprovalProposal,
  offchainProposalId,
}: Props) => {
  const [selectedVoterType, setSelectedVoterType] = useState<VoterTypes>(
    VOTER_TYPES[0]
  );

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

  // Set the initial votes list
  useEffect(() => {
    if (isFetched && fetchedNonVotes) {
      setPages([fetchedNonVotes]);
      setMeta(fetchedNonVotes.meta);
    }
  }, [fetchedNonVotes, isFetched]);

  const loadMore = useCallback(async () => {
    if (!fetching.current && meta?.has_next) {
      fetching.current = true;
      const data = await fetchVotersWhoHaveNotVotedForProposal(
        proposal.id,
        {
          limit: LIMIT,
          offset: meta.next_offset,
        },
        offchainProposalId,
        selectedVoterType.type
      );
      setPages((prev) => [...prev, { ...data, votes: data.data }]);
      setMeta(data.meta);
      fetching.current = false;
    }
  }, [proposal, meta, selectedVoterType]);

  const voters = pages.flatMap((page) => page.data);

  const isThresholdCriteria =
    isApprovalProposal &&
    (proposal.proposalData as ParsedProposalData["APPROVAL"]["kind"])
      .proposalSettings?.criteria === "THRESHOLD";

  return (
    <>
      {offchainProposalId && (
        <ProposalVoterListFilter
          selectedVoterType={selectedVoterType}
          onVoterTypeChange={(type) => setSelectedVoterType(type)}
        />
      )}
      <div
        className={cn(
          "px-4 pb-4 overflow-y-auto min-h-[36px]",
          isThresholdCriteria || proposal.proposalType === "SNAPSHOT"
            ? "max-h-[calc(100vh-560px)]"
            : isApprovalProposal
              ? "max-h-[calc(100vh-527px)]"
              : "max-h-[calc(100vh-437px)]"
        )}
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
    </>
  );
};

export default ProposalNonVoterList;
