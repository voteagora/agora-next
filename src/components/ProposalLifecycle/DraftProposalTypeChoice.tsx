"use client";

import React, { useContext, useEffect } from "react";
import { ProposalLifecycleDraftContext } from "@/contexts/ProposalLifecycleDraftContext";
import { ProposalDraft } from "@prisma/client";

interface DraftProposalTypeChoiceProps {
  label: string;
  explanation: string;
  proposal: ProposalDraft;
  updateProposal: (
    proposal: ProposalDraft,
    updateData: Partial<ProposalDraft>
  ) => void;
}

const DraftProposalTypeChoice: React.FC<DraftProposalTypeChoiceProps> = (
  props
) => {
  const { label, explanation, proposal, updateProposal } = props;

  const { proposalState, updateProposalType } = useContext(
    ProposalLifecycleDraftContext
  );

  async function handleUpdateProposalType(
    proposalType: "executable" | "social"
  ) {
    updateProposalType(proposalType);
    updateProposal(proposal, { proposal_type: proposalType });
  }

  useEffect(() => {
    updateProposalType(proposal.proposal_type);
  }, [proposal]);

  return (
    <div className="flex flex-col px-6 mb-5">
      <label className="font-medium text-sm mb-1">{label}</label>
      <div className="flex flex-row items-center gap-x-4">
        <div className="flex flex-row p-1 rounded-lg border border-gray-eo">
          <button
            className={`py-2 px-5 font-medium rounded-lg ${
              proposalState.proposalType === "executable"
                ? "bg-gray-fa"
                : "text-gray-af"
            }`}
            onClick={() => handleUpdateProposalType("executable")}
          >
            Executable
          </button>
          <button
            className={`py-2 px-5 font-medium rounded-lg ${
              proposalState.proposalType === "social"
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
