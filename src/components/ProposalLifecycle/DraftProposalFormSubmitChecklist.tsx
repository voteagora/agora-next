import React, { useContext } from "react";
import { Checkbox } from "../ui/checkbox";
import { ProposalLifecycleDraftContext } from "@/contexts/ProposalLifecycleDraftContext";

interface DraftProposalFormSubmitChecklistProps {
  // Define your component's props here
}

const DraftProposalFormSubmitChecklist: React.FC<
  DraftProposalFormSubmitChecklistProps
> = (props) => {
  const { state } = useContext(ProposalLifecycleDraftContext);

  return (
    <ul className="border border-gray-eo rounded-lg w-full divide-y divide-gray-eo">
      <DraftProposalFormSubmitChecklistRow
        title="Discourse Temp Check"
        status={state.tempCheckLink !== ""}
      />
      <DraftProposalFormSubmitChecklistRow
        title="Transaction simulation"
        status={false}
      />
      <DraftProposalFormSubmitChecklistRow
        title="Draft created and shared on forums"
        status={true}
      />
      <DraftProposalFormSubmitChecklistRow
        title="ENS docs updated"
        status={true}
      />
      <DraftProposalFormSubmitChecklistRow
        title="100k ENS proposal threshold"
        status={false}
      />
    </ul>
  );
};

export default DraftProposalFormSubmitChecklist;

interface DraftProposalFormSubmitChecklistRowProps {
  title: string;
  status: boolean;
}

const DraftProposalFormSubmitChecklistRow: React.FC<
  DraftProposalFormSubmitChecklistRowProps
> = (props) => {
  const { title, status } = props;

  return (
    <li className="w-full flex flex-row items-center justify-between p-4 font-medium">
      <p>{title}</p>
      <div className="flex flex-row items-center">
        <p className="text-xs mr-3 text-gray-af font-medium">
          on 11/24/23 (by karpatkey.eth)
        </p>
        <Checkbox checked={status} />
      </div>
    </li>
  );
};
