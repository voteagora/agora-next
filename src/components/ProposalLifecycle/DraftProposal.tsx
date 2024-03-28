"use client";

import DraftProposalChecklist from "@/components/ProposalLifecycle/DraftProposalChecklist";
import DraftProposalForm from "@/components/ProposalLifecycle/DraftProposalForm";
import React, { useState } from "react";
import prisma from "@/app/lib/prisma";
import {
  ProposalChecklist,
  ProposalDraft,
  ProposalDraftOption,
  ProposalDraftTransaction,
} from "@prisma/client";
import { ProposalDraftWithTransactions } from "@/components/ProposalLifecycle/types";
import { createGithubProposal as handleCreateGithubProposal } from "@/components/ProposalLifecycle/github";

interface DraftProposalProps {
  proposal: ProposalDraftWithTransactions;
  getProposal: (
    proposal_id: string
  ) => Promise<ProposalDraftWithTransactions | null>;
  updateProposal: (
    proposal: ProposalDraft,
    updateData: Partial<ProposalDraft>
  ) => Promise<ProposalDraft>;
  addTransaction: (
    proposalId: number,
    transactionType: "transfer" | "custom"
  ) => Promise<ProposalDraftTransaction>;
  updateTransaction: (
    transactionId: number,
    data: Partial<ProposalDraftTransaction>
  ) => Promise<ProposalDraftTransaction>;
  deleteTransaction: (
    transactionId: number
  ) => Promise<ProposalDraftTransaction[]>;
  createGithubProposal: (
    proposal: ProposalDraftWithTransactions
  ) => Promise<string>;
  saveSocialProposalOptions: (
    proposal: ProposalDraft,
    options: string[]
  ) => Promise<void>;
  getProposalChecklist: (proposal_id: string) => Promise<ProposalChecklist[]>;
  registerChecklistEvent: (
    proposal_id: string,
    stage: string,
    completed_by: string
  ) => void;
}
const DraftProposal: React.FC<DraftProposalProps> = (props) => {
  const {
    proposal,
    getProposal,
    updateProposal,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    createGithubProposal,
    saveSocialProposalOptions,
    getProposalChecklist,
    registerChecklistEvent,
  } = props;

  const [proposalState, setProposalState] =
    useState<ProposalDraftWithTransactions>(proposal);

  return (
    <div className="flex flex-row gap-x-6 pt-9 items-start max-w-screen-xl mx-auto">
      <DraftProposalForm
        proposal={proposal}
        proposalState={proposalState}
        setProposalState={setProposalState}
        getProposal={getProposal}
        updateProposal={updateProposal}
        addTransaction={addTransaction}
        updateTransaction={updateTransaction}
        deleteTransaction={deleteTransaction}
        createGithubProposal={createGithubProposal}
        saveSocialProposalOptions={saveSocialProposalOptions}
        getProposalChecklist={getProposalChecklist}
        registerChecklistEvent={registerChecklistEvent}
      />
      <DraftProposalChecklist proposal={proposalState} />
    </div>
  );
};

export default DraftProposal;
