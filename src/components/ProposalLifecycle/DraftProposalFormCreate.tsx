import React from "react";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion-proposal-draft";

const staticText = {
  heading: "Create proposal draft",
  description:
    "We encourage you to go to Discourse to post a temp check that helps gauge the community’s interest. It’s not mandatory, but helps create alignment with the voter base.",
};

const DraftProposalFormCreate: React.FC = () => {
  return (
    <div className="">
      <AccordionItem
        value="draft-create"
        className="w-full rounded-2xl border border-gray-eo shadow-sm"
      >
        <AccordionTrigger>
          <h2 className="text-2xl font-black">{staticText.heading}</h2>
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-gray-4f px-6">{staticText.description}</p>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
};

export default DraftProposalFormCreate;
