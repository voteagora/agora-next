import React from "react";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion-proposal-draft";

const DraftProposalFormCreate: React.FC = () => {
  return (
    <div className="">
      <AccordionItem
        value="draft-create"
        className="w-full rounded-2xl border border-gray-eo"
      >
        <AccordionTrigger>
          <h2 className="text-2xl font-bold">Create proposal draft</h2>
        </AccordionTrigger>
        <AccordionContent>
          <p>test content</p>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
};

export default DraftProposalFormCreate;
