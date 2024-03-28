"use client";

import React, { useContext, useEffect } from "react";
import { ProposalDraft } from "@prisma/client";
import { ProposalDraftWithTransactions } from "./types";

interface DraftProposalSocialVotingStrategyTypeProps {
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

const DraftProposalSocialVotingStrategyType: React.FC<
  DraftProposalSocialVotingStrategyTypeProps
> = (props) => {
  const {
    label,
    explanation,
    proposalState,
    setProposalState,
    updateProposal,
  } = props;

  async function handleUpdateSocialVotingStrategyType(
    socialVotingStrategyType: "basic" | "approval"
  ) {
    const updatedProposal = await updateProposal(proposalState, {
      voting_strategy_social: socialVotingStrategyType,
    });
    setProposalState({
      ...updatedProposal,
      transactions: proposalState.transactions,
      ProposalDraftOption: proposalState.ProposalDraftOption,
    });
  }

  return (
    <div className="flex flex-col mb-5">
      <label className="font-medium text-sm mb-1">{label}</label>
      <div className="flex flex-row items-center gap-x-4">
        <div className="flex flex-row p-1 rounded-lg border border-gray-eo">
          <button
            className={`py-2 px-5 font-medium rounded-lg ${
              proposalState.voting_strategy_social === "basic"
                ? "bg-gray-fa"
                : "text-gray-af"
            }`}
            onClick={() => handleUpdateSocialVotingStrategyType("basic")}
          >
            Basic
          </button>
          <button
            className={`py-2 px-5 font-medium rounded-lg ${
              proposalState.voting_strategy_social === "approval"
                ? "bg-gray-fa"
                : "text-gray-af"
            }`}
            onClick={() => handleUpdateSocialVotingStrategyType("approval")}
          >
            Approval
          </button>
        </div>
        <p className="text-xs max-w-[390px] text-gray-4f">{explanation}</p>
      </div>
    </div>
  );
};

export default DraftProposalSocialVotingStrategyType;
