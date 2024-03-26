import React from "react";
import prisma from "@/app/lib/prisma";
import DraftProposalSponsorNote from "@/components/ProposalLifecycle/DraftProposalSponsorNote";
import DraftProposalSponsorReview from "@/components/ProposalLifecycle/DraftProposalSponsorReview";
import { ProposalDraftWithTransactions } from "@/components/ProposalLifecycle/types";
import { ProposalChecklist, ProposalDraft } from "@prisma/client";
import DraftProposalSponsor from "@/components/ProposalLifecycle/DraftProposalSponsor";

async function getProposal(
  proposal_id: string
): Promise<ProposalDraftWithTransactions | null> {
  const proposal = await prisma.proposalDraft.findUnique({
    where: {
      id: Number(proposal_id),
    },
    include: {
      transactions: true,
    },
  });

  return proposal;
}

async function getProposalChecklist(
  proposal_id: string
): Promise<ProposalChecklist[]> {
  "use server";

  const proposalChecklist = await prisma.proposalChecklist.findMany({
    where: {
      proposal_id: Number(proposal_id),
    },
  });

  return proposalChecklist;
}

async function updateProposal(
  proposal: ProposalDraft,
  updateData: Partial<ProposalDraft>
): Promise<ProposalDraft> {
  "use server";

  const updatedProposal = await prisma.proposalDraft.update({
    where: {
      id: proposal.id,
    },
    data: updateData,
  });

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
    <DraftProposalSponsor
      proposal={proposal}
      updateProposal={updateProposal}
      getProposalChecklist={getProposalChecklist}
    />
  );
}
