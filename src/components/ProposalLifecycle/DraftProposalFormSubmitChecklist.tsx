import React from "react";

interface DraftProposalFormSubmitChecklistProps {
  // Define your component's props here
}

const DraftProposalFormSubmitChecklist: React.FC<
  DraftProposalFormSubmitChecklistProps
> = (props) => {
  return (
    <ul className="border border-gray-eo rounded-lg w-full divide-y divide-gray-eo">
      <DraftProposalFormSubmitChecklistRow title="Discourse Temp Check" />
      <DraftProposalFormSubmitChecklistRow title="Draft created and shared on forums" />
      <DraftProposalFormSubmitChecklistRow title="Transaction simulation" />
      <DraftProposalFormSubmitChecklistRow title="ENS docs updated" />
      <DraftProposalFormSubmitChecklistRow title="100k ENS proposal threshold" />
    </ul>
  );
};

export default DraftProposalFormSubmitChecklist;

interface DraftProposalFormSubmitChecklistRowProps {
  title: string;
}

const DraftProposalFormSubmitChecklistRow: React.FC<
  DraftProposalFormSubmitChecklistRowProps
> = (props) => {
  const { title } = props;

  return (
    <li className="w-full flex flex-row items-center justify-between p-4 font-medium">
      <p>{title}</p>
      <div className="flex flex-row items-center">
        <p className="text-xs mr-3 text-gray-af font-medium">
          on 11/24/23 (by karpatkey.eth)
        </p>
        <input type="checkbox" className="w-4 h-4 border-2 border-black" />
      </div>
    </li>
  );
};
