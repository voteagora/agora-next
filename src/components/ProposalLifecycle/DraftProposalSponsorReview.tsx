"use client";

import React, { useContext, useState } from "react";

import { Proposal } from "@prisma/client";

interface DraftProposalSponsorReviewProps {
  proposal: Proposal;
  updateProposal: (proposal: Proposal, updateData: Partial<Proposal>) => void;
}

const DraftProposalSponsorReview: React.FC<DraftProposalSponsorReviewProps> = (
  props
) => {
  const { proposal, updateProposal } = props;

  return (
    <div className="flex-grow">
      <div className="flex flex-col min-h-screen">
        <p>id: {proposal.id}</p>
        <p>{proposal.title}</p>
        <p>{proposal.description}</p>
      </div>
    </div>
  );
};

export default DraftProposalSponsorReview;
