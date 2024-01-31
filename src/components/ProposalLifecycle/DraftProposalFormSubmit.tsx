import React from "react";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion-proposal-draft";

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
          <p>test content</p>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
};

export default DraftProposalFormSubmit;
