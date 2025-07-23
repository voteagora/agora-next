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
import { HStack } from "@/components/Layout/Stack";
import { icons } from "@/assets/icons/icons";

type Props = {
  proposal: Proposal;
};

export default function HybridApprovalVotesPanel({ proposal }: Props) {
  const [showVoters, setShowVoters] = useState(true);
  const [activeTab, setActiveTab] = useState("results");
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const hybridApprovalData =
    proposal.proposalData as ParsedProposalData["HYBRID_APPROVAL"]["kind"];

  const handleClick = () => {
    setIsClicked(!isClicked);
  };

  return (
    <>
      <div
        className={`fixed flex-col justify-between gap-4 md:sticky top-[auto] md:top-20 md:max-h-inherit max-h-[calc(100%-160px)] items-stretch flex-shrink w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] md:w-[20rem] lg:w-[24rem] bg-neutral transition-all ${isClicked ? "bottom-[20px]" : "bottom-[calc(-100%+350px)] h-[calc(100%-160px)] md:h-auto"}`}
        style={{
          transition: "bottom 600ms cubic-bezier(0, 0.975, 0.015, 0.995)",
        }}
      >
        <button
          onClick={handleClick}
          className="border w-10 h-10 rounded-full bg-neutral absolute top-[-20px] left-[calc(50%-20px)] shadow-newDefault block md:hidden"
        >
          <HStack justifyContent="justify-center">
            <img className="opacity-60" src={icons.expand.src} alt="expand" />
          </HStack>
        </button>
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
              <div className="static md:sticky bottom-0 w-full right-0 border-t">
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
        <VoteOnAtlas
          offchainProposalId={proposal.offchainProposalId || proposal.id}
        />
      </div>
    </>
  );
}
