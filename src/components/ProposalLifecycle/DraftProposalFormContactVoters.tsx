import React, { useContext } from "react";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion-proposal-draft";
import DraftProposalReview from "./DraftProposalReview";
import { ProposalDraft } from "@prisma/client";
import { LinkIcon } from "@heroicons/react/20/solid";
import toast from "react-hot-toast";
import { ProposalDraftWithTransactions } from "./types";

const staticText = {
  description:
    "Please proofread a preview of your proposal below. If you need to change any of its content, please edit your draft in the previous step.",
};

interface DraftProposalContactVotersProps {
  proposalState: ProposalDraftWithTransactions;
  setProposalState: React.Dispatch<
    React.SetStateAction<ProposalDraftWithTransactions>
  >;
  updateProposal: (
    proposal: ProposalDraft,
    updateData: Partial<ProposalDraft>
  ) => Promise<ProposalDraft>;
}

const DraftProposalContactVoters: React.FC<DraftProposalContactVotersProps> = (
  props
) => {
  const { proposalState, setProposalState, updateProposal } = props;

  const handleContactedVoters = async () => {
    const updatedProposal = await updateProposal(proposalState, {
      proposal_status_id: 6,
    });

    setProposalState({
      ...updatedProposal,
      transactions: proposalState.transactions,
      ProposalDraftOption: proposalState.ProposalDraftOption,
    });
  };

  return (
    <div className="bg-gray-fa rounded-2xl ring-1 ring-inset ring-gray-eo">
      <AccordionItem
        value="contact-voters"
        className="w-full rounded-2xl bg-white border border-gray-eo shadow-sm"
      >
        <AccordionTrigger>
          <h2 className="text-2xl font-black">Contact voters</h2>
        </AccordionTrigger>
      </AccordionItem>
      {proposalState.proposal_status_id == 5 && (
        <div className="flex flex-row gap-x-6 p-6">
          <p className="text-stone-700">
            {`Please follow the steps from the handbook to ensure that delegates have been notified on telegram and discourse.`}
          </p>
          <button
            className={`w-[300px] py-3 px-6 border font-medium border-black bg-black text-white rounded-lg`}
            onClick={handleContactedVoters}
          >
            <span className="text-center">I contacted the voters</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default DraftProposalContactVoters;
