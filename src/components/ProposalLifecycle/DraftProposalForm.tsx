"use client";

import React, { useContext, useState } from "react";

import { Accordion } from "@/components/ui/accordion-proposal-draft";
import DraftProposalFormTempCheck from "./DraftProposalFormTempCheck";
import DraftProposalFormCreate from "./DraftProposalFormCreate";
import DraftProposalFormSubmit from "./DraftProposalFormSubmit";

import { ProposalDraft, ProposalDraftTransaction } from "@prisma/client";
import { ProposalDraftWithTransactions } from "@/components/ProposalLifecycle/types";

type ProposalLifecycleDraftStage =
  | "draft-temp-check"
  | "draft-create"
  | "draft-submit";

interface DraftProposalFormProps {
  proposal: ProposalDraftWithTransactions;
  getProposal: (
    proposal_id: string
  ) => Promise<ProposalDraftWithTransactions | null>;
  updateProposal: (
    proposal: ProposalDraft,
    updateData: Partial<ProposalDraft>
  ) => Promise<ProposalDraft>;
  addTransaction: (proposalId: number) => Promise<ProposalDraftTransaction>;
  updateTransaction: (
    transactionId: number,
    data: Partial<ProposalDraftTransaction>
  ) => Promise<ProposalDraftTransaction>;
}

const DraftProposalForm: React.FC<DraftProposalFormProps> = (props) => {
  const {
    proposal,
    getProposal,
    updateProposal,
    addTransaction,
    updateTransaction,
  } = props;

  const [proposalState, setProposalState] =
    useState<ProposalDraftWithTransactions>(proposal);

  const [stage, setStage] =
    useState<ProposalLifecycleDraftStage>("draft-temp-check");

  return (
    <div className="flex-grow">
      <Accordion
        type="single"
        collapsible
        className="flex flex-col min-h-screen"
        value={proposalState.proposal_status == "draft" ? stage : ""}
        onValueChange={(value) =>
          setStage(value as ProposalLifecycleDraftStage)
        }
      >
        <DraftProposalFormTempCheck
          setStage={setStage}
          proposalState={proposalState}
          updateProposal={updateProposal}
        />
        <div className="border-l border-dashed border-gray-eo w-0 h-8 ml-6"></div>
        <DraftProposalFormCreate
          setStage={setStage}
          proposalState={proposalState}
          setProposalState={setProposalState}
          getProposal={getProposal}
          updateProposal={updateProposal}
          addTransaction={addTransaction}
          updateTransaction={updateTransaction}
        />
        <div className="border-l border-dashed border-gray-eo w-0 h-8 ml-6"></div>
        <DraftProposalFormSubmit
          proposal={proposal}
          updateProposal={updateProposal}
        />
      </Accordion>
    </div>
  );
};

export default DraftProposalForm;
