"use client";

import React, { useContext, useEffect, useState } from "react";

import DraftProposalFormSubmitChecklist from "./DraftProposalFormSubmitChecklist";
import { ProposalLifecycleDraftContext } from "@/contexts/ProposalLifecycleDraftContext";
import { Proposal } from "@prisma/client";

interface DraftProposalReviewProps {
  proposal: Proposal;
  updateProposal: (proposal: Proposal, updateData: Partial<Proposal>) => void;
}

const DraftProposalReview: React.FC<DraftProposalReviewProps> = (props) => {
  const { proposalState, updateProposalStatus } = useContext(
    ProposalLifecycleDraftContext
  );

  const { proposal, updateProposal } = props;

  const handleSubmitProposal = () => {
    // TODO unify states and names across frontend state and database
    const updateData = {
      proposal_status: "sponsor_requested",
    };
    updateProposal(proposal, updateData);

    updateProposalStatus("awaiting_sponsor");
  };

  return (
    <div className="flex-grow">
      <div className="bg-[#FAFAF2] rounded-2xl ring-inset ring-1 ring-[#ECE3CA] z-10 mx-6">
        <div className="flex flex-row justify-between px-6 text-[#B16B19] text-xs font-medium py-2">
          <p>Your proposal review</p>
          <p>Please review carefully</p>
        </div>
        <div className="pt-6 pb-9 bg-white border border-gray-eb rounded-2xl z-20">
          <div className="flex flex-col gap-y-6 px-6 border-b border-gray-eb pb-8">
            <h3 className="text-2xl font-black">{proposalState.title}</h3>
            <div className="bg-[#F7F7F7] h-[160px] rounded-lg border border-gray-eo"></div>
            <div className="flex flex-col gap-y-1 text-base">
              <label className="font-medium">Description</label>
              <p className="text-gray-4f">{proposalState.description}</p>
            </div>
            <div className="flex flex-col gap-y-1 text-base">
              <label className="font-medium">Abstract</label>
              {/* TODO in markdown */}
              <p className="text-gray-4f max-w-[620px]">
                {proposalState.abstract}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-y-5 text-base px-6 pt-6">
            <DraftProposalFormSubmitChecklist />
            <div className="flex flex-row items-center justify-between">
              <p className="w-[440px] text-stone-700">
                Please make sure to proofread your proposal as it cannot be
                edited once submitted.
              </p>

              <button
                className="flex flex-row justify-center shadow-sm py-3 px-6 bg-black text-white rounded-lg mt-4"
                onClick={() => handleSubmitProposal()}
              >
                Submit proposal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftProposalReview;
