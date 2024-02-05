"use client";

import React, { useContext } from "react";
import { ProposalLifecycleDraftContext } from "@/contexts/ProposalLifecycleDraftContext";

interface DraftProposalTypeChoiceProps {
  label: string;
  explanation: string;
}

const DraftProposalTypeChoice: React.FC<DraftProposalTypeChoiceProps> = (
  props
) => {
  const { label, explanation } = props;

  const { state, updateProposalType } = useContext(
    ProposalLifecycleDraftContext
  );

  return (
    <div className="flex flex-col px-6 mb-5">
      <label className="font-medium text-sm mb-1">{label}</label>
      <div className="flex flex-row items-center gap-x-4">
        <div className="flex flex-row p-1 rounded-lg border border-gray-eo">
          <button
            className={`py-2 px-5 font-medium rounded-lg ${
              state.proposalType === "executable"
                ? "bg-gray-fa"
                : "text-gray-af"
            }`}
            onClick={() => updateProposalType("executable")}
          >
            Executable
          </button>
          <button
            className={`py-2 px-5 font-medium rounded-lg ${
              state.proposalType === "social" ? "bg-gray-fa" : "text-gray-af"
            }`}
            onClick={() => updateProposalType("social")}
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
