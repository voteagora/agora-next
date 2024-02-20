"use client";

import React, { useState } from "react";

import { Accordion } from "@/components/ui/accordion-proposal-draft";
import DraftProposalFormTempCheck from "./DraftProposalFormTempCheck";
import DraftProposalFormCreate from "./DraftProposalFormCreate";
import DraftProposalFormSubmit from "./DraftProposalFormSubmit";

import { Proposal } from "@prisma/client";

type ProposalLifecycleDraftStage =
  | "draft-temp-check"
  | "draft-create"
  | "draft-submit";

interface DraftProposalFormProps {
  proposal: Proposal;
  updateProposal: (proposal: Proposal, updateData: Partial<Proposal>) => void;
}

const DraftProposalForm: React.FC<DraftProposalFormProps> = (props) => {
  const [stage, setStage] =
    useState<ProposalLifecycleDraftStage>("draft-temp-check");

  const { proposal, updateProposal } = props;

  return (
    <div className="flex-grow">
      <Accordion
        type="single"
        collapsible
        className="flex flex-col min-h-screen"
        value={stage}
        onValueChange={(value) =>
          setStage(value as ProposalLifecycleDraftStage)
        }
      >
        <DraftProposalFormTempCheck
          setStage={setStage}
          proposal={proposal}
          updateProposal={updateProposal}
        />
        <div className="border-l border-dashed border-gray-eo w-0 h-8 ml-6"></div>
        <DraftProposalFormCreate
          setStage={setStage}
          proposal={proposal}
          updateProposal={updateProposal}
        />
        <div className="border-l border-dashed border-gray-eo w-0 h-8 ml-6"></div>
        <DraftProposalFormSubmit />
      </Accordion>
    </div>
  );
};

export default DraftProposalForm;
