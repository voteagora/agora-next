"use client";

import React, { useContext } from "react";
import { ProposalLifecycleDraftContext } from "@/contexts/ProposalLifecycleDraftContext";

import { ProposalDraft } from "@prisma/client";
import { DebounceInput } from "react-debounce-input";
import { ProposalDraftWithTransactions } from "./types";

interface DraftProposalTitleInputProps {
  label: string;
  placeholder: string;
  proposalState: ProposalDraftWithTransactions;
  updateProposal: (
    proposal: ProposalDraft,
    updateData: Partial<ProposalDraft>
  ) => Promise<ProposalDraft>;
}

const DraftProposalTitleInput: React.FC<DraftProposalTitleInputProps> = (
  props
) => {
  const { label, placeholder, proposalState, updateProposal } = props;

  async function handleUpdateTitle(title: string) {
    updateProposal(proposalState, { title: title });
  }

  return (
    <div className="flex flex-col px-6 mb-5">
      <label className="font-medium text-sm mb-1">{label}</label>
      {/* @ts-expect-error Server Component */}
      <DebounceInput
        debounceTimeout={1000}
        className="py-3 px-4 w-full border border-gray-eo placeholder-gray-af bg-gray-fa rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-af focus:border-transparent"
        placeholder={placeholder}
        value={proposalState.title}
        onChange={(e) => handleUpdateTitle(e.target.value)}
      />
    </div>
  );
};

export default DraftProposalTitleInput;
