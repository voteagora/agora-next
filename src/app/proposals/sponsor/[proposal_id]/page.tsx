import React from "react";
import prisma from "@/app/lib/prisma";
import { Proposal } from "@prisma/client";
import DraftProposalSponsorNote from "@/components/ProposalLifecycle/DraftProposalSponsorNote";
import DraftProposalSponsorReview from "@/components/ProposalLifecycle/DraftProposalSponsorReview";

async function getProposal(proposal_id: string): Promise<Proposal | null> {
  const proposal = await prisma.proposal.findUnique({
    where: {
      id: Number(proposal_id),
    },
  });

  return proposal;
}

async function updateProposal(
  proposal: Proposal,
  updateData: Partial<Proposal>
): Promise<Proposal> {
  "use server";

  const updatedProposal = await prisma.proposal.update({
    where: {
      id: proposal.id,
    },
    data: updateData,
  });

  console.log("updatedProposal", updatedProposal);

  return updatedProposal;
}

export default async function DraftProposalPage({
  params: { proposal_id },
}: {
  params: { proposal_id: string };
}) {
  const proposal = await getProposal(proposal_id);

  if (!proposal) {
    return {
      notFound: true,
    };
  }

  return (
    <div className="flex flex-row gap-x-6 pt-9 items-start max-w-screen-xl mx-auto">
      <DraftProposalSponsorReview
        proposal={proposal}
        updateProposal={updateProposal}
      />
      <DraftProposalSponsorNote />
    </div>
  );
}
