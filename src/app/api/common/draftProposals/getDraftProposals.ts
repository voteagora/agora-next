import prisma from "@/app/lib/prisma";
import { DraftProposal } from "@/app/proposals/draft/types";
import { cache } from "react";
import { DaoSlug } from "@prisma/client";

const getDraftProposal = async (id: number, slug: DaoSlug) => {
  const draftProposal = await prisma.proposalDraft.findUnique({
    where: {
      id: id,
      dao_slug: slug,
    },
    include: {
      transactions: true,
      social_options: true,
      checklist_items: true,
      approved_sponsors: true,
      approval_options: {
        include: {
          transactions: true,
        },
      },
    },
  });

  return draftProposal as DraftProposal;
};

export const fetchDraftProposal = cache(getDraftProposal);
