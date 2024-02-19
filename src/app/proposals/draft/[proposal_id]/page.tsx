import DraftProposalChecklist from "@/components/ProposalLifecycle/DraftProposalChecklist";
import DraftProposalForm from "@/components/ProposalLifecycle/DraftProposalForm";
import React from "react";
import prisma from "@/app/lib/prisma";
import { Proposal } from "@prisma/client";

async function createProposal(): Promise<Proposal> {
  const proposal = await prisma.proposal.create({
    data: {
      temp_check_link: "test",
      proposal_type: "social",
      title: "TEST PROPOSAL 1",
      description: "test",
      abstract: "test",
      audit_url: "test",
      update_ens_docs_status: true,
      post_on_discourse_status: true,
      dao: "ens",
      proposal_status: "draft",
      author_address: "0x123",
    },
  });

  return proposal;
}

async function getProposal(proposal_id: string): Promise<Proposal | null> {
  const proposal = await prisma.proposal.findUnique({
    where: {
      id: Number(proposal_id),
    },
  });

  return proposal;
}

async function getProposalOrCreateNew(
  proposal_id: string
): Promise<Proposal | null> {
  if (proposal_id === "new") {
    return createProposal();
  } else {
    return getProposal(proposal_id);
  }
}

async function updateProposal(
  proposal: Proposal,
  field: string,
  value: string | boolean
): Promise<Proposal> {
  "use server";

  return await prisma.proposal.update({
    where: {
      id: proposal.id,
    },
    data: {
      [field]: value,
    },
  });
}

export default async function DraftProposalPage({
  params: { proposal_id },
}: {
  params: { proposal_id: string };
}) {
  const proposalDraft = await getProposalOrCreateNew(proposal_id);

  if (!proposalDraft) {
    return {
      notFound: true,
    };
  }

  return (
    <div className="flex flex-row gap-x-6 pt-9 items-start max-w-screen-xl mx-auto">
      <DraftProposalForm
        proposal={proposalDraft}
        updateProposal={updateProposal}
      />
      <DraftProposalChecklist />
    </div>
  );
}
