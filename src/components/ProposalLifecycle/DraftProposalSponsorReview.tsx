"use client";

import React, { useContext, useEffect, useState } from "react";

import DraftProposalFormSubmitChecklist from "./DraftProposalFormSubmitChecklist";
import { ProposalDraft } from "@prisma/client";
import { ProposalDraftWithTransactions } from "./types";
import MarkdownPreview from "@uiw/react-markdown-preview";

interface DraftProposalReviewProps {
  proposal: ProposalDraftWithTransactions;
  updateProposal: (
    proposal: ProposalDraft,
    updateData: Partial<ProposalDraft>
  ) => Promise<ProposalDraft>;
}

const DraftProposalReview: React.FC<DraftProposalReviewProps> = (props) => {
  const { proposal } = props;

  return (
    <div className="flex-grow">
      <div className="bg-[#FAFAF2] rounded-2xl ring-inset ring-1 ring-[#ECE3CA] z-10 mx-6">
        <div className="flex flex-row justify-between px-6 text-[#B16B19] text-xs font-medium py-2">
          <p>Your proposal review</p>
          <p>Please review carefully</p>
        </div>
        <div className="pt-6 pb-9 bg-white border border-gray-eb rounded-2xl z-20">
          <div className="flex flex-col gap-y-6 px-6 border-b border-gray-eb pb-8">
            <h3 className="text-2xl font-black">{proposal.title}</h3>
            <div className="bg-[#F7F7F7] rounded-lg border border-gray-eo w-[620px] break-all">
              <p className="stone-500 text-xs pt-3 px-6">
                Proposed transactions
              </p>
              {proposal.transactions.map((transaction, index) => {
                return (
                  <div
                    key={index}
                    className="flex flex-col justify-between px-6 py-4 text-stone-700 text-xs"
                  >
                    <p>{`// ${transaction.description}`}</p>
                    <p>{transaction.target}</p>
                    <p>{transaction.function_details}</p>
                    <p>{transaction.value}</p>
                    <p>{transaction.calldata}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col gap-y-1 text-base">
              <label className="font-medium">Description</label>
              <p className="text-gray-4f">{proposal.description}</p>
            </div>
            <div className="flex flex-col gap-y-1 text-base">
              <label className="font-medium">Abstract</label>
              {/* TODO in markdown */}
              <MarkdownPreview
                source={proposal.abstract}
                className="h-full py-3 rounded-t-lg max-w-[650px] bg-transparent"
                // make background transparent
                style={{
                  backgroundColor: "transparent",
                }}
                wrapperElement={{
                  "data-color-mode": "light",
                }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-y-5 text-base px-6 pt-6">
            <DraftProposalFormSubmitChecklist proposalState={proposal} />
            <div className="flex flex-row items-center justify-between">
              <p className="w-[440px] text-stone-700">
                Please make sure to proofread your proposal as it cannot be
                edited once submitted.
              </p>

              <button className="flex flex-row justify-center shadow-sm py-3 px-6 bg-black text-white rounded-lg mt-4">
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftProposalReview;
