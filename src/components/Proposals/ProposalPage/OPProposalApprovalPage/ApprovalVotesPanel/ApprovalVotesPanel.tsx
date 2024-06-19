"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { VStack, HStack } from "@/components/Layout/Stack";
import OptionsResultsPanel from "../OptionResultsPanel/OptionResultsPanel";
import ApprovalProposalVotesList from "@/components/Votes/ApprovalProposalVotesList/ApprovalProposalVotesList";
import ApprovalProposalCriteria from "../ApprovalProposalCriteria/ApprovalProposalCriteria";
import ApprovalCastVoteButton from "@/components/Votes/ApprovalCastVoteButton/ApprovalCastVoteButton";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { Vote } from "@/app/api/common/votes/vote";
import { VotingPowerData } from "@/app/api/common/voting-power/votingPower";
import { Delegate } from "@/app/api/common/delegates/delegate";

type Props = {
  proposal: Proposal;
  initialProposalVotes: {
    meta: {
      currentPage: number;
      pageSize: number;
      hasNextPage: boolean;
    };
    votes: Vote[];
  };
  fetchVotesForProposal: (
    proposal_id: string,
    page?: number
  ) => Promise<{
    meta: {
      currentPage: number;
      pageSize: number;
      hasNextPage: boolean;
    };
    votes: Vote[];
  }>;
  fetchAllForVoting: (
    address: string | `0x${string}`,
    blockNumber: number,
    proposal_id: string
  ) => Promise<{
    votingPower: VotingPowerData;
    authorityChains: string[][];
    delegate: Delegate;
    votesForProposalAndDelegate: Vote[];
  }>;
  fetchUserVotesForProposal: (
    proposal_id: string,
    address: string | `0x${string}`
  ) => Promise<Vote[]>;
};

export default function ApprovalVotesPanel({
  proposal,
  initialProposalVotes,
  fetchVotesForProposal,
  fetchAllForVoting,
  fetchUserVotesForProposal,
}: Props) {
  const [activeTab, setActiveTab] = useState(1);
  const [isPending, startTransition] = useTransition();
  function handleTabsChange(index: number) {
    startTransition(() => {
      setActiveTab(index);
    });
  }
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
          <ApprovalProposalVotesList
            initialProposalVotes={initialProposalVotes}
            fetchVotesForProposal={fetchVotesForProposal}
            fetchUserVotes={fetchUserVotesForProposal}
            proposal_id={proposal.id}
          />
        )}
        <ApprovalProposalCriteria proposal={proposal} />
        <div className="px-4 pb-6">
          <ApprovalCastVoteButton
            proposal={proposal}
            fetchAllForVoting={fetchAllForVoting}
          />
        </div>
      </VStack>
    </motion.div>
  );
}
