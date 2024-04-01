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
            <div className="flex flex-row justify-center items-center w-4 h-4 border border-gray-eo rounded-full">
              <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
          )}
          {proposal.proposal_status_id == index + 1 && index !== 3 && (
            <div className="w-4 h-4 border border-gray-eo rounded-full bg-gray-eo"></div>
          )}
          {proposal.proposal_status_id == index + 1 && index === 3 && (
            <div role="status" className="flex flex-row justify-center py-4">
              <svg
                aria-hidden="true"
                className="w-4 h-4 text-gray-200 animate-spin fill-gray-900"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          )}
          {proposal.proposal_status_id < index + 1 && (
            <div className="w-4 h-4 border border-gray-eo rounded-full"></div>
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
