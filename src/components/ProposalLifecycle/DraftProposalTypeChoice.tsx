"use client";

import React, { useContext, useEffect } from "react";
import { ProposalDraft } from "@prisma/client";
import { ProposalDraftWithTransactions } from "./types";

interface DraftProposalTypeChoiceProps {
  label: string;
  explanation: string;
  proposalState: ProposalDraftWithTransactions;
  setProposalState: React.Dispatch<
    React.SetStateAction<ProposalDraftWithTransactions>
  >;
  updateProposal: (
    proposal: ProposalDraft,
    updateData: Partial<ProposalDraft>
  ) => Promise<ProposalDraft>;
}

const DraftProposalTypeChoice: React.FC<DraftProposalTypeChoiceProps> = (
  props
) => {
  const {
    label,
    explanation,
    proposalState,
    setProposalState,
    updateProposal,
  } = props;

  async function handleUpdateProposalType(
    proposalType: "executable" | "social"
  ) {
    const updatedProposal = await updateProposal(proposalState, {
      proposal_type: proposalType,
    });

    setProposalState({
      ...updatedProposal,
      transactions: proposalState.transactions,
      ProposalDraftOption: proposalState.ProposalDraftOption,
    });
  }

  return (
    <div className="flex flex-col px-6 mb-5">
      <label className="font-medium text-sm mb-1">{label}</label>
      <div className="flex flex-row items-center gap-x-4">
        <div className="flex flex-row p-1 rounded-lg border border-gray-eo">
          <button
            className={`py-2 px-5 font-medium rounded-lg ${
              proposalState.proposal_type === "executable"
                ? "bg-gray-fa"
                : "text-gray-af"
            }`}
            onClick={() => handleUpdateProposalType("executable")}
          >
            Executable
          </button>
          <button
            className={`py-2 px-5 font-medium rounded-lg ${
              proposalState.proposal_type === "social"
                ? "bg-gray-fa"
                : "text-gray-af"
            }`}
            onClick={() => handleUpdateProposalType("social")}
          >
            Social
          </button>
        </div>
        <p className="text-xs max-w-[390px] text-gray-4f">{explanation}</p>
      </div>
    </div>
  );
};

export default DraftProposalTypeChoice;
