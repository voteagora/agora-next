"use client";

import React, { useContext } from "react";
import { ProposalLifecycleDraftContext } from "@/contexts/ProposalLifecycleDraftContext";

import { ProposalDraft } from "@prisma/client";
import { DebounceInput } from "react-debounce-input";

interface DraftProposalDescriptionInputProps {
  label: string;
  placeholder: string;
  proposal: ProposalDraft;
  updateProposal: (
    proposal: ProposalDraft,
    updateData: Partial<ProposalDraft>
  ) => void;
}

const DraftProposalDescriptionInput: React.FC<
  DraftProposalDescriptionInputProps
> = (props) => {
  const { label, placeholder, proposal, updateProposal } = props;

  const { proposalState, updateDescription } = useContext(
    ProposalLifecycleDraftContext
  );

  async function handleDescriptionUpdate(description: string) {
    updateDescription(description);
    updateProposal(proposal, { description: description });
  }

  return (
    <div className="flex flex-col px-6 mb-5">
      <label className="font-medium text-sm mb-1">{label}</label>
      {/* @ts-expect-error Server Component */}
      <DebounceInput
        debounceTimeout={1000}
        className="py-3 px-4 w-full border border-gray-eo placeholder-gray-af bg-gray-fa rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-af focus:border-transparent"
        placeholder={placeholder}
        value={proposal.description}
        onChange={(e) => handleDescriptionUpdate(e.target.value)}
      />
    </div>
  );
};

export default DraftProposalDescriptionInput;
