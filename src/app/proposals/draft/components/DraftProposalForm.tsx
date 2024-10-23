"use client";

import { useState, Suspense } from "react";
import { ProposalStage } from "@prisma/client";
import TempCheckForm from "./stages/TempCheckForm";
import DraftFormClient from "./stages/DraftForm/DraftFormClient";
import SubmitForm from "./stages/SubmitForm";
import GithubPRForm from "./stages/GithubPRForm";
import { DraftProposal } from "../types";
import CreatorAuthCheck from "./CreatorAuthCheck";
import { motion, AnimatePresence } from "framer-motion";

export default function DraftProposalForm({
  stage,
  draftProposal,
  proposalTypes,
}: {
  stage: ProposalStage;
  draftProposal: DraftProposal;
  proposalTypes: any[];
}) {
  const renderStage = (stage: ProposalStage) => {
    switch (stage) {
      case ProposalStage.ADDING_TEMP_CHECK:
        return <TempCheckForm draftProposal={draftProposal} />;
      case ProposalStage.DRAFTING:
        return (
          <Suspense fallback={"loading!"}>
            <DraftFormClient
              proposalTypes={proposalTypes}
              draftProposal={draftProposal}
            />
          </Suspense>
        );
      case ProposalStage.ADDING_GITHUB_PR:
        return <GithubPRForm draftProposal={draftProposal} />;
      case ProposalStage.AWAITING_SUBMISSION:
        return <SubmitForm draftProposal={draftProposal} />;
      default:
        return null;
    }
  };
  return (
    <CreatorAuthCheck
      creatorAddress={draftProposal.author_address as `0x${string}`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={stage}
          initial={{ x: "10%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-10%", opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderStage(stage)}
        </motion.div>
      </AnimatePresence>
    </CreatorAuthCheck>
  );
}
