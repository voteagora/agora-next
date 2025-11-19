"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { VStack, HStack } from "@/components/Layout/Stack";
import OptionsResultsPanel from "../OptionResultsPanel/OptionResultsPanel";
import ArchiveApprovalProposalVotesList from "@/components/Votes/ApprovalProposalVotesList/ArchiveApprovalProposalVotesList";
import ApprovalProposalVotesList from "@/components/Votes/ApprovalProposalVotesList/ApprovalProposalVotesList";
import ApprovalProposalCriteria from "../ApprovalProposalCriteria/ApprovalProposalCriteria";
import ApprovalCastVoteButton from "@/components/Votes/ApprovalCastVoteButton/ApprovalCastVoteButton";
import { Proposal } from "@/app/api/common/proposals/proposal";
import ProposalVotesFilter from "@/components/Proposals/ProposalPage/OPProposalPage/ProposalVotesCard/ProposalVotesFilter";
import ArchiveProposalNonVoterList from "@/components/Votes/ProposalVotesList/ArchiveProposalNonVoterList";
import ProposalNonVoterList from "@/components/Votes/ProposalVotesList/ProposalNonVoterList";
import { ParsedProposalData } from "@/lib/proposalUtils";
import { PaginationParams } from "@/app/lib/pagination";
import { Vote } from "@/app/api/common/votes/vote";
import { PaginatedResult } from "@/app/lib/pagination";
import Tenant from "@/lib/tenant/tenant";

type Props = {
  proposal: Proposal;
  fetchVotesForProposal: (
    proposalId: string,
    pagination?: PaginationParams
  ) => Promise<PaginatedResult<Vote[]>>;
  fetchUserVotes: (
    proposalId: string,
    address: string | `0x${string}`
  ) => Promise<Vote[]>;
};

export default function ApprovalVotesPanel({
  proposal,
  fetchVotesForProposal,
  fetchUserVotes,
}: Props) {
  const [showVoters, setShowVoters] = useState(true);
  const [activeTab, setActiveTab] = useState(1);
  const [isPending, startTransition] = useTransition();
  const { ui } = Tenant.current();
  const useArchiveVoteHistory = ui.toggle(
    "use-archive-for-vote-history"
  )?.enabled;

  function handleTabsChange(index: number) {
    startTransition(() => {
      setActiveTab(index);
    });
  }

  const isThresholdCriteria =
    (proposal.proposalData as ParsedProposalData["APPROVAL"]["kind"])
      .proposalSettings.criteria === "THRESHOLD";

  // Wrapper functions to match ApprovalProposalVotesList's expected signatures
  const handleFetchVotesForProposal = async (
    proposalId: string,
    pagination: PaginationParams
  ) => {
    return fetchVotesForProposal(proposalId, pagination);
  };

  const handleFetchUserVotes = async (proposalId: string, address: string) => {
    return fetchUserVotes(proposalId, address as `0x${string}`);
  };

  return (
    <motion.div
      className="flex flex-col"
      initial={{ opacity: 1 }}
      animate={{ opacity: isPending ? 0.3 : 1 }}
      transition={{ duration: 0.3, delay: isPending ? 0.3 : 0 }}
    >
      <VStack gap={1} className="relative min-h-0 h-full">
        {/* Tabs */}
        <HStack className="h-12 pt-4 px-4 mb-1">
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
        </HStack>
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
            {useArchiveVoteHistory ? (
              showVoters ? (
                <ArchiveApprovalProposalVotesList
                  proposal={proposal}
                  isThresholdCriteria={isThresholdCriteria}
                />
              ) : (
                <ArchiveProposalNonVoterList proposal={proposal} />
              )
            ) : showVoters ? (
              <ApprovalProposalVotesList
                fetchVotesForProposal={handleFetchVotesForProposal}
                fetchUserVotes={handleFetchUserVotes}
                proposalId={proposal.id}
                isThresholdCriteria={isThresholdCriteria}
              />
            ) : (
              <ProposalNonVoterList proposal={proposal} />
            )}
          </>
        )}
        <ApprovalProposalCriteria proposal={proposal} />
        <div className="px-4 pb-6">
          <ApprovalCastVoteButton proposal={proposal} />
        </div>
      </VStack>
    </motion.div>
  );
}
