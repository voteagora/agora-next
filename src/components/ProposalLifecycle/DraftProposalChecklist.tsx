import React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion-proposal-checklist";

interface DraftProposalChecklistRowProps {
  title: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface DraftProposalChecklistProps {
  proposalStatusId: number;
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

const DraftProposalChecklist: React.FC<DraftProposalChecklistProps> = ({
  proposalStatusId,
}) => {
  return (
    <div className="w-[350px] flex-shrink-0 bg-gray-fa border border-gray-eo rounded-2xl px-6 pt-6 pb-9">
      <h2 className="font-black text-2xl mb-7">Proposal checklist</h2>
      <Accordion type="single" collapsible>
        {checklistItems.map((item, index) => (
          <DraftProposalChecklistRow
            key={item.title}
            title={item.title}
            description={item.description}
            isCompleted={index < proposalStatusId - 1}
            isCurrent={index === proposalStatusId - 1}
          />
        ))}
      </Accordion>
    </div>
  );
};

const DraftProposalChecklistRow: React.FC<DraftProposalChecklistRowProps> = ({
  title,
  description,
  isCompleted,
  isCurrent,
}) => {
  const baseCircleStyle = {
    border: "2px solid #4B5563",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const completedCircleStyle = {
    ...baseCircleStyle,
    backgroundColor: "#4B5563",
  };

  const circleStyle = isCompleted ? completedCircleStyle : baseCircleStyle;

  return (
    <AccordionItem value={title} className="flex flex-col mb-4">
      <AccordionTrigger>
        <div className="w-full flex flex-row justify-between items-center">
          <h3
            className={`font-medium ${
              isCurrent ? "underline text-gray-900" : "text-gray-900"
            }`}
          >
            {title}
          </h3>
          <div className="w-4 h-4 rounded-full" style={circleStyle}></div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="w-full flex flex-row justify-between pt-2">
          <p className="text-gray-4f text-xs max-w-[280px]">{description}</p>
          <div className="w-4 flex justify-center">
            <div className={`h-[100px] w-0.5 bg-gray-eo`}></div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default DraftProposalChecklist;
