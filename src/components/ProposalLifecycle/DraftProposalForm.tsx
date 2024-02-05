"use client";

import React, { useState } from "react";

import { Accordion } from "@/components/ui/accordion-proposal-draft";
import DraftProposalFormTempCheck from "./DraftProposalFormTempCheck";
import DraftProposalFormCreate from "./DraftProposalFormCreate";
import DraftProposalFormSubmit from "./DraftProposalFormSubmit";

type ProposalLifecycleDraftStage =
  | "draft-temp-check"
  | "draft-create"
  | "draft-submit";

const DraftProposalForm: React.FC = () => {
  const [stage, setStage] =
    useState<ProposalLifecycleDraftStage>("draft-temp-check");

  return (
    <div className="flex-grow">
      <Accordion
        type="single"
        collapsible
        className="flex flex-col"
        value={stage}
        onValueChange={(value) =>
          setStage(value as ProposalLifecycleDraftStage)
        }
      >
        <DraftProposalFormTempCheck setStage={setStage} />
        <div className="border-l border-dashed border-gray-eo w-0 h-8 ml-6"></div>
        <DraftProposalFormCreate setStage={setStage} />
        <div className="border-l border-dashed border-gray-eo w-0 h-8 ml-6"></div>
        <DraftProposalFormSubmit />
      </Accordion>
    </div>
  );
};

export default DraftProposalForm;
