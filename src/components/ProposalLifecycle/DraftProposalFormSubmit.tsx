import React from "react";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion-proposal-draft";
import DraftProposalReview from "./DraftProposalReview";

const staticText = {
  description:
    "Please proofread a preview of your proposal below. If you need to change any of its content, please edit your draft in the previous step.",
};

const DraftProposalFormSubmit: React.FC = () => {
  return (
    <div className="">
      <AccordionItem
        value="draft-submit"
        className="w-full rounded-2xl border border-gray-eo shadow-sm"
      >
        <AccordionTrigger>
          <h2 className="text-2xl font-black">Submit proposal</h2>
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-gray-4f px-6 pb-7 max-w-[620px]">
            {staticText.description}
          </p>
          <DraftProposalReview description="asd" checkmarkInfo="asd" />
        </AccordionContent>
      </AccordionItem>
    </div>
  );
};

export default DraftProposalFormSubmit;
