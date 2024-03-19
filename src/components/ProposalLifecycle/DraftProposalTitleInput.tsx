"use client";

import React from "react";
import { ProposalDraft } from "@prisma/client";
import { DebounceInput } from "react-debounce-input";
import { ProposalDraftWithTransactions } from "./types";

interface DraftProposalTitleInputProps {
  label: string;
  proposalState: ProposalDraftWithTransactions;
  updateProposal: (
    proposal: ProposalDraft,
    updateData: Partial<ProposalDraft>
  ) => Promise<ProposalDraft>;
}

const DraftProposalTitleInput: React.FC<DraftProposalTitleInputProps> = ({
  label,
  proposalState,
  updateProposal,
}) => {
  const getPlaceholderText = (proposalType: string | undefined) => {
    switch (proposalType) {
      case "executable":
        return "[EPx.x][Executable] My proposal title...";
      case "social":
        return "[EPx.x][Social] My social proposal title...";
      default:
        return "Enter a title";
    }
  };

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
        placeholder={getPlaceholderText(proposalState.proposal_type)}
        value={proposalState.title}
        onChange={(e) => handleUpdateTitle(e.target.value)}
      />
    </div>
  );
};

export default DraftProposalTitleInput;
