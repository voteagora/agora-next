"use client";

import React, { useEffect } from "react";
import DraftProposalSponsorNote from "@/components/ProposalLifecycle/DraftProposalSponsorNote";
import DraftProposalSponsorReview from "@/components/ProposalLifecycle/DraftProposalSponsorReview";
import { ProposalDraftWithTransactions } from "@/components/ProposalLifecycle/types";
import { ProposalChecklist, ProposalDraft } from "@prisma/client";
import { useAccount } from "wagmi";

interface DraftProposalSponsorProps {
  proposal: ProposalDraftWithTransactions;
  updateProposal: (
    proposal: ProposalDraft,
    updateData: Partial<ProposalDraft>
  ) => Promise<ProposalDraft>;
  getProposalChecklist: (proposal_id: string) => Promise<ProposalChecklist[]>;
}

const DraftProposalSponsor: React.FC<DraftProposalSponsorProps> = ({
  proposal,
  updateProposal,
  getProposalChecklist,
}) => {
  const { address } = useAccount();

  useEffect(() => {
    if (address !== proposal.sponsor_address) {
      // redirect to main
      window.location.href = "/";
    }
  }, [address]);

  return (
    <div className="flex flex-row gap-x-6 pt-9 items-start max-w-screen-xl mx-auto">
      <DraftProposalSponsorReview
        proposal={proposal}
        updateProposal={updateProposal}
        getProposalChecklist={getProposalChecklist}
      />
      <DraftProposalSponsorNote proposal={proposal} />
    </div>
  );
};

export default DraftProposalSponsor;
