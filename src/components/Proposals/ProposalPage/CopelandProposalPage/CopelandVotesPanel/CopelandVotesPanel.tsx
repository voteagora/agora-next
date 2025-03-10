"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { SnapshotVote, VotesSort } from "@/app/api/common/votes/vote";
import { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import ProposalVotesFilter from "@/components/Proposals/ProposalPage/OPProposalPage/ProposalVotesCard/ProposalVotesFilter";
import ProposalNonVoterList from "@/components/Votes/ProposalVotesList/ProposalNonVoterList";
import { ParsedProposalData } from "@/lib/proposalUtils";
import Link from "next/link";
import CopelandProposalCriteria from "../CopelandProposalCriteria/CopelandProposalCriteria";
import CopelandProposalVotesList from "@/components/Votes/CopelandProposalVotesList/CopelandProposalVotesList";
import OptionsResultsPanel from "../OptionsResultsPanel/OptionsResultsPanel";
import ProposalStatusDetail from "@/components/Proposals/ProposalStatus/ProposalStatusDetail";

type Props = {
  proposal: Proposal;
  fetchVotesForProposal: (
    proposalId: string,
    pagination?: PaginationParams,
    sort?: VotesSort
  ) => Promise<PaginatedResult<SnapshotVote[]>>;
  fetchUserVotesForProposal: (
    proposalId: string,
    address: string | `0x${string}`
  ) => Promise<SnapshotVote[]>;
};

export default function CopelandVotesPanel({
  proposal,
  fetchVotesForProposal,
  fetchUserVotesForProposal,
}: Props) {
  const [showVoters, setShowVoters] = useState(true);
  const [activeTab, setActiveTab] = useState(1);
  const [isPending, startTransition] = useTransition();
  const proposalState = proposal.status;
  function handleTabsChange(index: number) {
    startTransition(() => {
      setActiveTab(index);
    });
  }

  return (
    <motion.div
      className="flex flex-col flex-1"
      initial={{ opacity: 1 }}
      animate={{ opacity: isPending ? 0.3 : 1 }}
      transition={{ duration: 0.3, delay: isPending ? 0.3 : 0 }}
    >
      <div className="flex flex-col gap-1 relative min-h-0 h-full">
        {/* Tabs */}
        <div className="flex h-12 pt-4 px-4 mb-1">
          {["Results", "Votes"].map((tab, index) => (
            <div
              key={index}
              onClick={() => handleTabsChange(index + 1)}
              className="text-base font-semibold pr-4 cursor-pointer"
            >
              <span
                className={
                  activeTab === index + 1 ? "text-secondary" : "text-tertiary"
                }
              >
                {tab}
              </span>
            </div>
          ))}
        </div>
        <ProposalStatusDetail
          proposalStatus={proposal.status}
          proposalEndTime={proposal.endTime}
          proposalStartTime={proposal.startTime}
          proposalCancelledTime={proposal.cancelledTime}
          proposalExecutedTime={proposal.executedTime}
          cancelledTransactionHash={proposal.cancelledTransactionHash}
          className="bg-white rounded-none border-b mb-1 py-4 mx-0"
        />
        {activeTab === 1 ? (
          <OptionsResultsPanel proposal={proposal} />
        ) : (
          <>
            <div className="px-4">
              <ProposalVotesFilter
                initialSelection={showVoters ? "Voters" : "Hasn't voted"}
                onSelectionChange={(value) => {
                  setShowVoters(value === "Voters");
                }}
              />
            </div>
            {showVoters ? (
              <CopelandProposalVotesList
                fetchVotesForProposal={fetchVotesForProposal}
                fetchUserVotes={fetchUserVotesForProposal}
                proposalId={proposal.id}
              />
            ) : (
              <ProposalNonVoterList
                proposal={proposal}
                isApprovalProposal={true}
              />
            )}
          </>
        )}
        <CopelandProposalCriteria />
        {proposalState === "ACTIVE" && (
          <div className="px-4 pb-6">
            <Link
              href={
                (
                  proposal.proposalData as ParsedProposalData["SNAPSHOT"]["kind"]
                ).link
              }
              target="_blank"
              className={`bg-primary hover:bg-primary/90 rounded-lg text-base cursor-pointer py-3 px-5 transition-all text-neutral font-semibold active:shadow-none h-10 capitalize flex items-center justify-center flex-1`}
            >
              Vote
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
