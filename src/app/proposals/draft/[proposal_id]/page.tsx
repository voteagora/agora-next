import DraftProposalChecklist from "@/components/ProposalLifecycle/DraftProposalChecklist";
import DraftProposalForm from "@/components/ProposalLifecycle/DraftProposalForm";
import React from "react";
import prisma from "@/app/lib/prisma";
import { ProposalDraft, ProposalDraftTransaction } from "@prisma/client";
import { ProposalDraftWithTransactions } from "@/components/ProposalLifecycle/types";

async function getProposal(
  proposal_id: string
): Promise<ProposalDraftWithTransactions | null> {
  "use server";

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

  console.log("updatedProposal", updatedProposal);

  return updatedProposal;
}

async function addTransaction(
  proposalId: number
): Promise<ProposalDraftTransaction> {
  "use server";

  const count = await prisma.proposalDraftTransaction.count({
    where: {
      proposal_id: proposalId,
    },
  });

  const transaction = await prisma.proposalDraftTransaction.create({
    data: {
      proposal_id: proposalId,
      order: count,
      target: "",
      value: "",
      calldata: "",
      function_details: "",
      contract_abi: "",
      description: "",
      is_valid: false,
    },
  });

  return transaction;
}

async function updateTransaction(
  transactionId: number,
  data: Partial<ProposalDraftTransaction>
): Promise<ProposalDraftTransaction> {
  "use server";

  const transaction = await prisma.proposalDraftTransaction.update({
    where: {
      id: transactionId,
    },
    data: data,
  });

  console.log("transaction", transaction);

  return transaction;
}

export default async function DraftProposalPage({
  params: { proposal_id },
}: {
  params: { proposal_id: string };
}) {
  const proposalDraft = await getProposal(proposal_id);

  if (!proposalDraft) {
    return {
      notFound: true,
    };
  }

  return (
    <div className="flex flex-row gap-x-6 pt-9 items-start max-w-screen-xl mx-auto">
      <DraftProposalForm
        proposal={proposalDraft}
        getProposal={getProposal}
        updateProposal={updateProposal}
        addTransaction={addTransaction}
        updateTransaction={updateTransaction}
      />
      <DraftProposalChecklist />
    </div>
  );
}
