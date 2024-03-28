"use client";

import React, { useState, useContext, useEffect } from "react";

import MarkdownPreview from "@uiw/react-markdown-preview";
import { ProposalDraft } from "@prisma/client";
import { DebounceInput } from "react-debounce-input";
import { ProposalDraftWithTransactions } from "./types";

// example markdown to test with for the developer convenience :)

// # This is a header
// ## This is a subheader
// this is a paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, diam, quisque amet, nunc. Sed euismod, diam, quisque amet, nunc.
// ## This is another subheader
// this is another paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, diam, quisque amet, nunc. Sed euismod, diam, quisque amet, nunc.
// this is list:
// - item 1
// - item 2
// - item 3

// this is the end

interface DraftProposalAbstractProps {
  label: string;
  placeholder: string;
  proposalState: ProposalDraftWithTransactions;
  setProposalState: React.Dispatch<
    React.SetStateAction<ProposalDraftWithTransactions>
  >;
  updateProposal: (
    proposal: ProposalDraft,
    updateData: Partial<ProposalDraft>
  ) => Promise<ProposalDraft>;
}

const DraftProposalAbstract: React.FC<DraftProposalAbstractProps> = (props) => {
  const {
    label,
    placeholder,
    proposalState,
    setProposalState,
    updateProposal,
  } = props;

  const [selectedMode, setSelectedMode] = useState<"write" | "preview">(
    "write"
  );

  async function handleAbstractUpdate(abstract: string) {
    const updatedProposal = await updateProposal(proposalState, {
      abstract: abstract,
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
      <div className="min-h-[215px] w-full border border-gray-eo rounded-t-lg bg-gray-fa">
        {selectedMode === "write" ? (
          /* @ts-expect-error Server Component */
          <DebounceInput
            element="textarea"
            debounceTimeout={500}
            className="py-3 px-4 border-0 placeholder-gray-af w-full bg-gray-fa rounded-t-lg focus:outline-none focus:ring-0 resize-none"
            placeholder={placeholder}
            value={proposalState.abstract}
            onChange={(e) => handleAbstractUpdate(e.target.value)}
            rows={8}
            forceNotifyByEnter={false}
          />
        ) : (
          <div>
            <MarkdownPreview
              source={proposalState.abstract}
              className="h-full py-3 px-4 rounded-t-lg max-w-[650px] bg-transparent"
              // make background transparent
              style={{
                backgroundColor: "transparent",
              }}
              wrapperElement={{
                "data-color-mode": "light",
              }}
            />
          </div>
        )}
      </div>
      <div className="w-full flex flex-row justify-end py-3 gap-x-1 rounded-b-lg border-x border-b border-gray-eo pr-2">
        <button
          className={`py-2 px-3 rounded-full font-medium ${
            selectedMode === "write" ? "bg-gray-fa text-black" : "text-gray-af"
          }`}
          onClick={() => setSelectedMode("write")}
        >
          Write
        </button>
        <button
          className={`py-2 px-3 rounded-full font-medium ${
            selectedMode === "preview"
              ? "bg-gray-fa text-black"
              : "text-gray-af"
          }`}
          onClick={() => setSelectedMode("preview")}
        >
          Preview
        </button>
      </div>
    </div>
  );
};

export default DraftProposalAbstract;
