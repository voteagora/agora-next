import { Checkbox } from "../ui/checkbox";
import { useContext, useState } from "react";
import { ProposalDraftWithTransactions } from "./types";
import { ProposalDraft } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ProposalLifecycle/DraftProposalCreateDialog";

interface DraftProposalCreateButtonProps {
  description: string;
  checkmarkInfo: string;
  proposalState: ProposalDraftWithTransactions;
  setProposalState: React.Dispatch<
    React.SetStateAction<ProposalDraftWithTransactions>
  >;
  updateProposal: (
    proposal: ProposalDraft,
    updateData: Partial<ProposalDraft>
  ) => Promise<ProposalDraft>;
  createGithubProposal: (
    proposal: ProposalDraftWithTransactions
  ) => Promise<string>;
  options: { index: number; value: string }[];
  saveSocialProposalOptions: (
    proposal: ProposalDraft,
    options: string[]
  ) => Promise<void>;
}

const DraftProposalCreateButton: React.FC<DraftProposalCreateButtonProps> = (
  props
) => {
  const {
    description,
    checkmarkInfo,
    proposalState,
    setProposalState,
    updateProposal,
    createGithubProposal,
    saveSocialProposalOptions,
    options,
  } = props;

  const handleContinue = async () => {
    const updatedProposal = await updateProposal(proposalState, {
      proposal_status_id: 3,
    });

    setProposalState({
      ...updatedProposal,
      transactions: proposalState.transactions,
    });
  };

  const saveAndUpdateDocs = async () => {
    if (proposalState.proposal_type === "social") {
      await saveSocialProposalOptions(
        proposalState,
        options.map((option) => option.value)
      );

      handleContinue();
      return;
    }

    // TODO save / run validation etc
    const prLink = await createGithubProposal(proposalState);

    alert("Proposal created! " + prLink);
  };

  return (
    <div className="bg-gray-fa rounded-b-2xl">
      <div className="flex flex-col px-6 pt-6 pb-9 bg-white border-gray-eb rounded-b-lg shadow">
        <div className="flex flex-row w-full justify-between items-center">
          <p className="text-gray-4f max-w-[400px]">{description}</p>
          <Dialog onOpenChange={(open) => open && saveAndUpdateDocs()}>
            <DialogTrigger>
              <button
                className={`w-[200px] py-3 px-6 border font-medium border-black bg-black text-white rounded-lg disabled:opacity-75 disabled:cursor-not-allowed`}
                disabled={
                  !proposalState.title ||
                  !proposalState.description ||
                  !proposalState.abstract
                }
              >
                <span className="text-center">Create draft</span>
              </button>
            </DialogTrigger>
            <DialogContent>
              <div className="px-6 py-8">
                <p className="font-medium mb-4 text-stone-900">
                  Draft successfully created!
                </p>
                <div className="flex flex-row justify-between mb-8">
                  <p className="text-stone-700">Update ENS docs</p>
                  <div className="text-green-600">
                    <p>Completed</p>
                  </div>
                </div>
                <button
                  className={`w-full py-3 px-6 border font-medium border-black bg-black text-white rounded-lg disabled:opacity-75 disabled:cursor-not-allowed`}
                  onClick={handleContinue}
                >
                  Continue
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex flex-col gap-y-2 p-6">
        <p className="font-medium text-gray-af text-xs">{checkmarkInfo}</p>
        <div className="flex flex-row w-full items-center">
          <p className="text-gray-4f pr-5">Update ENS docs</p>
          <div className="border-b border-dashed flex-grow border-gray-eo mr-5"></div>
          <Checkbox checked={true} />
        </div>
      </div>
    </div>
  );
};

export default DraftProposalCreateButton;
