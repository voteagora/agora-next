"use client";

import React, { useContext, useState } from "react";

import { Accordion } from "@/components/ui/accordion-proposal-draft";
import DraftProposalFormTempCheck from "./DraftProposalFormTempCheck";
import DraftProposalFormCreate from "./DraftProposalFormCreate";
import DraftProposalFormSubmit from "./DraftProposalFormSubmit";

import {
  ProposalChecklist,
  ProposalDraft,
  ProposalDraftTransaction,
} from "@prisma/client";
import { ProposalDraftWithTransactions } from "@/components/ProposalLifecycle/types";
import DraftProposalContactVoters from "./DraftProposalFormContactVoters";

type ProposalLifecycleDraftStage =
  | "draft-temp-check"
  | "draft-create"
  | "draft-submit"
  | "awaiting-sponsor"
  | "contact-voters";

interface DraftProposalFormProps {
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

const DraftProposalForm: React.FC<DraftProposalFormProps> = (props) => {
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

  function getCurrentStage(
    proposal_status_id: number
  ): ProposalLifecycleDraftStage {
    switch (proposal_status_id) {
      case 1:
        return "draft-temp-check";
      case 2:
        return "draft-create";
      case 3:
        return "draft-submit";
      case 4:
        return "awaiting-sponsor";
      case 5:
        return "contact-voters";
      default:
        return "draft-temp-check";
    }
  }

  return (
    <div className="flex-grow">
      <Accordion
        type="single"
        collapsible
        className="flex flex-col min-h-screen"
        value={getCurrentStage(proposalState.proposal_status_id)}
      >
        <DraftProposalFormTempCheck
          proposalState={proposalState}
          setProposalState={setProposalState}
          updateProposal={updateProposal}
          registerChecklistEvent={registerChecklistEvent}
        />
        <div className="border-l border-dashed border-gray-eo w-0 h-8 ml-6"></div>
        <DraftProposalFormCreate
          proposalState={proposalState}
          setProposalState={setProposalState}
          getProposal={getProposal}
          updateProposal={updateProposal}
          addTransaction={addTransaction}
          updateTransaction={updateTransaction}
          deleteTransaction={deleteTransaction}
          createGithubProposal={createGithubProposal}
          saveSocialProposalOptions={saveSocialProposalOptions}
          registerChecklistEvent={registerChecklistEvent}
        />
        <div className="border-l border-dashed border-gray-eo w-0 h-8 ml-6"></div>
        <DraftProposalFormSubmit
          proposalState={proposalState}
          setProposalState={setProposalState}
          updateProposal={updateProposal}
          getProposalChecklist={getProposalChecklist}
        />
        <div className="border-l border-dashed border-gray-eo w-0 h-8 ml-6"></div>
        <DraftProposalContactVoters
          proposalState={proposalState}
          setProposalState={setProposalState}
          updateProposal={updateProposal}
        />
      </Accordion>
    </div>
  );
};

export default DraftProposalForm;
