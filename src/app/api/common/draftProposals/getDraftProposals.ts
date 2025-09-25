import { prismaWeb2Client } from "@/app/lib/prisma";
import { DraftProposal } from "@/app/proposals/draft/types";
import { cache } from "react";

const getDraftProposal = async (id: number) => {
  const draftProposal = await prismaWeb2Client.proposalDraft.findUnique({
    where: {
      id: id,
    },
    include: {
      transactions: true,
      social_options: true,
      checklist_items: true,
      approval_options: {
        include: {
          transactions: true,
        },
      },
    },
  });

  return draftProposal as DraftProposal;
};

export const getDraftProposalByUuid = async (uuid: string) => {
  const draftProposal = await prismaWeb2Client.proposalDraft.findUnique({
    where: { uuid },
    include: {
      transactions: true,
      social_options: true,
      checklist_items: true,
      approval_options: {
        include: { transactions: true },
      },
    },
  });
  return draftProposal as DraftProposal;
};

export const fetchDraftProposal = cache(getDraftProposal);
