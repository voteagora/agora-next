import { ProposalLifecycleDraftContext } from "@/contexts/ProposalLifecycleDraftContext";
import { Checkbox } from "../ui/checkbox";
import { useContext, useState } from "react";
import { ProposalDraftWithTransactions } from "./types";
import { ProposalDraft } from "@prisma/client";

interface DraftProposalCreateButtonProps {
  description: string;
  checkmarkInfo: string;
  setStage: React.Dispatch<
    React.SetStateAction<"draft-temp-check" | "draft-create" | "draft-submit">
  >;
  proposalState: ProposalDraftWithTransactions;
  setProposalState: React.Dispatch<
    React.SetStateAction<ProposalDraftWithTransactions>
  >;
  updateProposal: (
    proposal: ProposalDraft,
    updateData: Partial<ProposalDraft>
  ) => Promise<ProposalDraft>;
}

const DraftProposalCreateButton: React.FC<DraftProposalCreateButtonProps> = (
  props
) => {
  const {
    description,
    checkmarkInfo,
    setStage,
    proposalState,
    setProposalState,
    updateProposal,
  } = props;

  const saveAndContinue = async () => {
    // TODO save / run validation etc

    setStage("draft-submit");
  };

  const handleChangeUpdateENSDocsStatus = () => {
    setProposalState({
      ...proposalState,
      update_ens_docs_status: !proposalState.update_ens_docs_status,
    });

    // TODO sync with DB after we make the decision with ENS
  };

  const handleChangePostOnDiscourseStatus = () => {
    setProposalState({
      ...proposalState,
      post_on_discourse_status: !proposalState.post_on_discourse_status,
    });

    // TODO sync with DB after we make the decision with ENS
  };

  return (
    <div className="bg-gray-fa rounded-b-2xl">
      <div className="flex flex-col px-6 pt-6 pb-9 bg-white border-gray-eb rounded-b-lg shadow">
        <div className="flex flex-row w-full justify-between items-center">
          <p className="text-gray-4f max-w-[400px]">{description}</p>
          <button
            className={`w-[200px] py-3 px-6 border font-medium border-black bg-black text-white rounded-lg disabled:opacity-75 disabled:cursor-not-allowed`}
            onClick={() => saveAndContinue()}
            disabled={
              !proposalState.title ||
              !proposalState.description ||
              !proposalState.abstract ||
              proposalState.transactions.length === 0
            }
          >
            <span className="text-center">Create draft</span>
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-y-2 p-6">
        <p className="font-medium text-gray-af text-xs">{checkmarkInfo}</p>
        <div className="flex flex-row w-full items-center">
          <p className="text-gray-4f pr-5">Update ENS docs</p>
          <div className="border-b border-dashed flex-grow border-gray-eo mr-5"></div>
          <Checkbox
            checked={proposalState.update_ens_docs_status}
            onCheckedChange={() => handleChangeUpdateENSDocsStatus()}
          />
        </div>
        <div className="flex flex-row w-full items-center">
          <p className="text-gray-4f pr-5">Post draft on discourse</p>
          <div className="border-b border-dashed flex-grow border-gray-eo mr-5"></div>
          <Checkbox
            checked={proposalState.update_ens_docs_status}
            onCheckedChange={() => handleChangePostOnDiscourseStatus()}
          />
        </div>
      </div>
    </div>
  );
};

export default DraftProposalCreateButton;
