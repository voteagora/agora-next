"use client";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { useState } from "react";
import HybridStandardProposalVotesSummary from "../ProposalVotesSummary/HybridStandardProposalVotesSummary";
import ProposalStatusDetail from "@/components/Proposals/ProposalStatus/ProposalStatusDetail";
import ProposalVotesList from "@/components/Votes/ProposalVotesList/ProposalVotesList";
import ProposalVotesFilter from "./ProposalVotesFilter";
import ProposalNonVoterList from "@/components/Votes/ProposalVotesList/ProposalNonVoterList";
import { ProposalVotesTab } from "@/components/common/ProposalVotesTab";
import { VoteOnAtlas } from "@/components/common/VoteOnAtlas";

const HybridStandardProposalVotesCard = ({
  proposal,
}: {
  proposal: Proposal;
}) => {
  const [activeTab, setTab] = useState("results");
  const [showVoters, setShowVoters] = useState(true);
  return (
    <>
      <div
        className={`fixed flex-col justify-between gap-4 md:sticky top-[auto] md:top-20 md:max-h-[calc(100vh-220px)] max-h-[calc(100%-160px)] items-stretch flex-shrink w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] md:w-[20rem] lg:w-[24rem] bg-neutral border border-line rounded-xl mb-2 transition-all bottom-[20px] h-[calc(100%-160px)] md:h-auto sm:overflow-y-auto`}
        style={{
          transition: "bottom 600ms cubic-bezier(0, 0.975, 0.015, 0.995)",
        }}
      >
        <ProposalVotesTab setTab={setTab} activeTab={activeTab} />

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
            <HybridStandardProposalVotesSummary proposal={proposal} />
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
    </>
  );
};

export default HybridStandardProposalVotesCard;
