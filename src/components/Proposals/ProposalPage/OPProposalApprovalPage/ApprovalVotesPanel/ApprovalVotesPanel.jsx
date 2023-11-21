"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { VStack, HStack } from "@/components/Layout/Stack";
import styles from "./approvalVotesPanel.module.scss";
import OptionsResultsPanel from "../OptionResultsPanel/OptionResultsPanel";
import VotesListPanel from "../VotesListPanel/VotesListPanel";

export default function ApprovalVotesPanel({ proposal }) {
  const [activeTab, setActiveTab] = useState(1);
  const [isPending, startTransition] = useTransition();
  function handleTabsChange(index) {
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
          <VotesListPanel proposal={proposal} />
        )}
        {/* <ApprovalProposalCriteria
          fragmentRef={criteriaFragmentRef}
          proposalRef={proposalRef}
        />
        <div
          className={css`
            padding: 0 ${theme.spacing["4"]} ${theme.spacing["6"]}
              ${theme.spacing["4"]};
          `}
        >
          <ApprovalCastVoteButton
            castVoteFragmentRef={castVoteFragmentRef}
            buttonFragmentRef={buttonFragmentRef}
            delegateFragmentRef={delegateFragmentRef}
          />
        </div> */}
      </VStack>
    </motion.div>
  );
}
