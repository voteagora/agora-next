"use client";

import React, { useContext } from "react";
import { ProposalLifecycleDraftContext } from "@/contexts/ProposalLifecycleDraftContext";

interface DraftProposalTitleInputProps {
  label: string;
  placeholder: string;
}

const DraftProposalTitleInput: React.FC<DraftProposalTitleInputProps> = (
  props
) => {
  const { label, placeholder } = props;

  const { state, updateTitle } = useContext(ProposalLifecycleDraftContext);

  return (
    <div className="flex flex-col px-6 mb-5">
      <label className="font-medium text-sm mb-1">{label}</label>
      <input
        className="py-3 px-4 w-full border border-gray-eo placeholder-gray-af bg-gray-fa rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-af focus:border-transparent"
        placeholder={placeholder}
        value={state.title}
        onChange={(e) => updateTitle(e.target.value)}
      ></input>
    </div>
  );
};

export default DraftProposalTitleInput;
