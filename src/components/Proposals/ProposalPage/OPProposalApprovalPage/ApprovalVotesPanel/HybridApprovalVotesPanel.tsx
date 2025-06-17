"use client";

import { useState } from "react";
import HybridOptionsResultsPanel from "../OptionResultsPanel/HybridOptionsResultsPanel";
import ApprovalCastVoteButton from "@/components/Votes/ApprovalCastVoteButton/ApprovalCastVoteButton";
import { Proposal } from "@/app/api/common/proposals/proposal";
import ProposalVotesFilter from "@/components/Proposals/ProposalPage/OPProposalPage/ProposalVotesCard/ProposalVotesFilter";
import ProposalNonVoterList from "@/components/Votes/ProposalVotesList/ProposalNonVoterList";
import { ParsedProposalData } from "@/lib/proposalUtils";
import { ProposalVotesTab } from "@/components/common/ProposalVotesTab";
import ProposalStatusDetail from "@/components/Proposals/ProposalStatus/ProposalStatusDetail";
import ProposalVotesList from "@/components/Votes/ProposalVotesList/ProposalVotesList";
import { HybridApprovalCriteria } from "../ApprovalProposalCriteria/HybridApprovalCriteria";
import { VoteOnAtlas } from "@/components/common/VoteOnAtlas";

type Props = {
  proposal: Proposal;
};

export default function HybridApprovalVotesPanel({ proposal }: Props) {
  const [showVoters, setShowVoters] = useState(true);
  const [activeTab, setActiveTab] = useState("results");
  const hybridApprovalData =
    proposal.proposalData as ParsedProposalData["HYBRID_APPROVAL"]["kind"];

  return (
    <>
      <div
        className={`fixed flex-col justify-between gap-4 md:sticky top-[auto] md:top-20 md:max-h-[calc(100vh-220px)] max-h-[calc(100%-160px)] items-stretch flex-shrink w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] md:w-[20rem] lg:w-[24rem] bg-neutral transition-all bottom-[20px] h-[calc(100%-160px)] md:h-auto overflow-hidden`}
        style={{
          transition: "bottom 600ms cubic-bezier(0, 0.975, 0.015, 0.995)",
        }}
      >
        <div className="border border-line rounded-xl mb-2">
          <ProposalVotesTab setTab={setActiveTab} activeTab={activeTab} />

          {activeTab === "results" ? (
            <>
              <div className="p-4 border-b border-line">
                <ProposalStatusDetail
                  proposalStatus={proposal.status}
                  proposalEndTime={proposal.endTime}
                  proposalStartTime={proposal.startTime}
                  proposalCancelledTime={proposal.cancelledTime}
                  proposalExecutedTime={proposal.executedTime}
                  cancelledTransactionHash={proposal.cancelledTransactionHash}
                  className="border-none m-0 p-0 bg-neutral"
                />
              </div>
              <HybridOptionsResultsPanel proposal={proposal} />
              <div className="sticky bottom-0 w-full right-0 border-t">
                <div className="p-4 bg-neutral">
                  <HybridApprovalCriteria
                    proposalSettings={hybridApprovalData?.proposalSettings}
                  />
                </div>
                <div className="p-4 border-t pt-1">
                  <ApprovalCastVoteButton proposal={proposal} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="px-3 py-[10px]">
                <ProposalVotesFilter
                  initialSelection={showVoters ? "Voters" : "Hasn't voted"}
                  onSelectionChange={(value) => {
                    setShowVoters(value === "Voters");
                  }}
                />
              </div>
              {showVoters ? (
                <ProposalVotesList proposalId={proposal.id} />
              ) : (
                <ProposalNonVoterList proposal={proposal} />
              )}
            </>
          )}
        </div>
        <VoteOnAtlas />
      </div>
    </>
  );
}
