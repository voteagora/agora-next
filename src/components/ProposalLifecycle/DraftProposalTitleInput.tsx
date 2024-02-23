"use client";

import React, { useContext } from "react";
import { ProposalLifecycleDraftContext } from "@/contexts/ProposalLifecycleDraftContext";

import { ProposalDraft } from "@prisma/client";
import { DebounceInput } from "react-debounce-input";

interface DraftProposalTitleInputProps {
  label: string;
  placeholder: string;
  proposal: ProposalDraft;
  updateProposal: (
    proposal: ProposalDraft,
    updateData: Partial<ProposalDraft>
  ) => void;
}

const DraftProposalTitleInput: React.FC<DraftProposalTitleInputProps> = (
  props
) => {
  const { label, placeholder, proposal, updateProposal } = props;

  const { proposalState, updateTitle } = useContext(
    ProposalLifecycleDraftContext
  );

  async function handleUpdateTitle(title: string) {
    updateTitle(title);
    updateProposal(proposal, { title: title });
  }

  return (
    <div className="flex flex-col px-6 mb-5">
      <label className="font-medium text-sm mb-1">{label}</label>
      {/* @ts-expect-error Server Component */}
      <DebounceInput
        debounceTimeout={1000}
        className="py-3 px-4 w-full border border-gray-eo placeholder-gray-af bg-gray-fa rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-af focus:border-transparent"
        placeholder={placeholder}
        value={proposal.title}
        onChange={(e) => handleUpdateTitle(e.target.value)}
      />
    </div>
  );
};

export default DraftProposalTitleInput;
