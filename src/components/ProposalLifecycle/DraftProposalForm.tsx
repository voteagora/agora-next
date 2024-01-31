import React from "react";

import { Accordion } from "@/components/ui/accordion-proposal-draft";
import DraftProposalFormTempCheck from "./DraftProposalFormTempCheck";
import DraftProposalFormCreate from "./DraftProposalFormCreate";
import DraftProposalFormSubmit from "./DraftProposalFormSubmit";

const DraftProposalForm: React.FC = () => {
  return (
    <div className="flex-grow">
      <Accordion type="single" collapsible className="flex flex-col">
        <DraftProposalFormTempCheck />
        <div className="border-l border-dashed border-gray-eo w-0 h-8 ml-6"></div>
        <DraftProposalFormCreate />
        <div className="border-l border-dashed border-gray-eo w-0 h-8 ml-6"></div>
        <DraftProposalFormSubmit />
      </Accordion>
    </div>
  );
};

export default DraftProposalForm;
