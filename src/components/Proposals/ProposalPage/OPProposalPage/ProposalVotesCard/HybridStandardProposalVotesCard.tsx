"use client";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import HybridStandardProposalVotesSummary from "../ProposalVotesSummary/HybridStandardProposalVotesSummary";
import ProposalStatusDetail from "@/components/Proposals/ProposalStatus/ProposalStatusDetail";

const HybridStandardProposalVotesCardTabs = ({
  proposal,
  setTab,
  activeTab,
}: {
  proposal: Proposal;
  setTab: (tab: string) => void;
  activeTab: string;
}) => {
  return (
    <div className="pl-4 pt-6 pr-6 border-b border-line">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setTab(value)}
        className="w-full"
      >
        <TabsList className="h-auto">
          <TabsTrigger value="results" variant="underlined">
            Results
          </TabsTrigger>
          <TabsTrigger value="votes" variant="underlined">
            Votes
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

const HybridStandardProposalStatusDetails = ({
  proposal,
}: {
  proposal: Proposal;
}) => {
  return (
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
  );
};

const HybridStandardProposalVotesCard = ({
  proposal,
}: {
  proposal: Proposal;
}) => {
  const [activeTab, setTab] = useState("results");
  return (
    <div
      className={`fixed flex-col justify-between gap-4 md:sticky top-[auto] md:top-20 md:max-h-[calc(100vh-220px)] max-h-[calc(100%-160px)] items-stretch flex-shrink w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] md:w-[20rem] lg:w-[24rem] bg-neutral border border-line rounded-xl shadow-newDefault mb-8 transition-all bottom-[20px] h-[calc(100%-160px)] md:h-auto sm:overflow-y-auto`}
      style={{
        transition: "bottom 600ms cubic-bezier(0, 0.975, 0.015, 0.995)",
      }}
    >
      <HybridStandardProposalVotesCardTabs
        proposal={proposal}
        setTab={setTab}
        activeTab={activeTab}
      />

      {activeTab === "results" ? (
        <>
          <HybridStandardProposalStatusDetails proposal={proposal} />
          <HybridStandardProposalVotesSummary proposal={proposal} />
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default HybridStandardProposalVotesCard;
