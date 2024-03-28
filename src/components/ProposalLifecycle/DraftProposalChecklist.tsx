import React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion-proposal-checklist";
import { ProposalDraft } from "@prisma/client";
import { CheckmarkIcon } from "react-hot-toast";
import { icons } from "@/assets/icons/icons";

interface DraftProposalChecklistRowProps {
  title: string;
  description: string;
  index: number;
  proposal: ProposalDraft;
}

interface DraftProposalChecklistProps {
  proposal: ProposalDraft;
}

const checklistItems = [
  {
    title: "Create temp check",
    description:
      "You can think of temperature checks as as question to the voters to gauge whether they are interested in the idea behind your proposal. Though this step is not mandatory, we recommend against skipping it unless you are confident that there’s alignment within the community for your proposal.",
  },
  {
    title: "Create draft",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, diam, quisque amet, nunc. Sed euismod, diam, quisque amet, nunc.",
  },
  {
    title: "Submit a proposal",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, diam, quisque amet, nunc. Sed euismod, diam, quisque amet, nunc.",
  },
  {
    title: "Wait for sponsor",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, diam, quisque amet, nunc. Sed euismod, diam, quisque amet, nunc.",
  },
  {
    title: "Contact voters",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, diam, quisque amet, nunc. Sed euismod, diam, quisque amet, nunc.",
  },
  {
    title: "Queue proposal",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, diam, quisque amet, nunc. Sed euismod, diam, quisque amet, nunc.",
  },
  {
    title: "Execute proposal",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, diam, quisque amet, nunc. Sed euismod, diam, quisque amet, nunc.",
  },
];

const DraftProposalChecklist: React.FC<DraftProposalChecklistProps> = (
  props
) => {
  const { proposal } = props;

  return (
    <div className="w-[350px] flex-shrink-0 bg-gray-fa border border-gray-eo rounded-2xl px-6 pt-6 pb-9">
      <h2 className="font-black text-2xl mb-7">Proposal checklist</h2>
      <Accordion
        type="single"
        value={`${proposal.proposal_status_id}`}
        collapsible
      >
        {checklistItems.map((item, index) => (
          <DraftProposalChecklistRow
            key={item.title}
            title={item.title}
            description={item.description}
            index={index}
            proposal={proposal}
          />
        ))}
      </Accordion>
    </div>
  );
};

const DraftProposalChecklistRow: React.FC<DraftProposalChecklistRowProps> = (
  props
) => {
  const { title, description, proposal, index } = props;

  return (
    <AccordionItem value={`${index + 1}`} className="flex flex-col mb-4">
      <AccordionTrigger>
        <div className="w-full flex flex-row justify-between items-center">
          <h3 className="font-medium">{title}</h3>
          {proposal.proposal_status_id > index + 1 && (
            <CheckmarkIcon className="w-4 h-4 text-green-500" />
          )}
          {proposal.proposal_status_id == index + 1 && (
            <div className="w-5 h-5 border-2 border-gray-eo rounded-full bg-gray-eo"></div>
          )}
          {proposal.proposal_status_id < index + 1 && (
            <div className="w-5 h-5 border-2 border-gray-eo rounded-full"></div>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="w-full flex flex-row justify-between pt-2">
          <p className="text-gray-4f text-xs max-w-[280px]">{description}</p>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default DraftProposalChecklist;
