"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { VStack, HStack } from "@/components/Layout/Stack";
import styles from "./approvalVotesPanel.module.scss";
import OptionsResultsPanel from "../OptionResultsPanel/OptionResultsPanel";
import ApprovalProposalVotesList from "@/components/Votes/ApprovalProposalVotesList/ApprovalProposalVotesList";
import ApprovalProposalCriteria from "../ApprovalProposalCriteria/ApprovalProposalCriteria";
import ApprovalCastVoteButton from "@/components/Votes/ApprovalCastVoteButton/ApprovalCastVoteButton";
import { Proposal } from "@/app/api/proposals/proposal";
import { Delegate } from "@/app/api/delegates/delegate";
import { Vote } from "@/app/api/votes/vote";
import { VotingPowerData } from "@/app/api/voting-power/votingPower";

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
  fetchVotingPower: (
    addressOrENSName: string | `0x${string}`,
    blockNumber: number
  ) => Promise<VotingPowerData>;
  fetchAuthorityChains: (
    address: string | `0x${string}`,
    blockNumber: number
  ) => Promise<{ chains: string[][] }>;
  fetchDelegate: (
    addressOrENSName: string | `0x${string}`
  ) => Promise<Delegate>;
  fetchVotesForProposalAndDelegate: (
    proposal_id: string,
    address: string | `0x${string}`
  ) => Promise<Vote[]>;
  fetchUserVotesForProposal: (
    proposal_id: string,
    address: string | `0x${string}`
  ) => Promise<Vote[]>;
};

export default function ApprovalVotesPanel({
  proposal,
  initialProposalVotes,
  fetchVotesForProposal,
  fetchVotingPower,
  fetchAuthorityChains,
  fetchDelegate,
  fetchVotesForProposalAndDelegate,
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
      className={styles.approval_votes_panel_container}
      initial={{ opacity: 1 }}
      animate={{ opacity: isPending ? 0.3 : 1 }}
      transition={{ duration: 0.3, delay: isPending ? 0.3 : 0 }}
    >
      <VStack gap={1} className={styles.approval_votes_panel}>
        {/* Tabs */}
        <HStack className={styles.approval_vote_tab_container}>
          {["Results", "Votes"].map((tab, index) => (
            <div key={index} onClick={() => handleTabsChange(index + 1)}>
              <span className={activeTab === index + 1 ? "text-black" : ""}>
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
        <div className={styles.button_container}>
          <ApprovalCastVoteButton
            proposal={proposal}
            fetchVotingPower={fetchVotingPower}
            fetchAuthorityChains={fetchAuthorityChains}
            fetchDelegate={fetchDelegate}
            fetchVotesForProposalAndDelegate={fetchVotesForProposalAndDelegate}
          />
        </div>
      </VStack>
    </motion.div>
  );
}
