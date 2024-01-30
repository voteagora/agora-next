import React from "react";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion-proposal-draft";

const DraftProposalFormTempCheck: React.FC = () => {
  return (
    <AccordionItem
      value="draft-temp-check"
      className="w-full rounded-2xl border border-gray-eo"
    >
      <AccordionTrigger>
        <h2 className="text-2xl font-bold">Create a temp check on Discourse</h2>
      </AccordionTrigger>
      <AccordionContent>
        <p>test content</p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default DraftProposalFormTempCheck;
