import React from "react";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion-proposal-draft";

import DraftProposalAbstract from "./DraftProposalAbstract";
import DraftProposalTextInput from "./DraftProposalTextInput";
import DraftProposalTypeChoice from "./DraftProposalTypeChoice";
import DraftProposalTransaction from "./DraftProposalTransaction";

const staticText = {
  heading: "Create proposal draft",
  description:
    "Use this draft to create and share the proposal you’d like to submit",
  proposalTypeExplanation:
    "Passed on-chain, Executable Proposals execute code related to ENS and ENS DAO contracts, as voted on by the DAO.",
  proposalTitlePlaceholder: "[EPx.x][Executable] My proposal title...",
  proposalDescriptionPlaceholder:
    "A short (1-2 sentence) description of the proposal...",
  proposalAbstractPlaceholder:
    "Here’s what my proposal aims to achieve (p.s. I like markdown formatting)...",
  proposedTransactionDescription:
    "Proposed transactions will execute after a proposal passes and then gets executed. If you skip this step, a transfer of 0 ETH to you (the proposer) will be added.",
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
          <p className="text-gray-4f px-6 pb-7 max-w-[620px]">
            {staticText.description}
          </p>
          <DraftProposalTypeChoice
            label="Proposal type"
            explanation={staticText.proposalTypeExplanation}
          />
          <DraftProposalTextInput
            label="Title"
            placeholder={staticText.proposalTitlePlaceholder}
          />
          <DraftProposalTextInput
            label="Description"
            placeholder={staticText.proposalDescriptionPlaceholder}
          />
          <DraftProposalAbstract
            label="Abstract"
            placeholder={staticText.proposalAbstractPlaceholder}
          />
          <DraftProposalTransaction
            label="Proposed transaction"
            description={staticText.proposedTransactionDescription}
          />
        </AccordionContent>
      </AccordionItem>
    </div>
  );
};

export default DraftProposalFormCreate;
