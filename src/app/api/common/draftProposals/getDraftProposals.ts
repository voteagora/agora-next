import { prismaWeb2Client } from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";
import { DraftProposal } from "@/app/proposals/draft/types";
import { cache } from "react";

const getDraftProposalByUuidInternal = async (uuid: string) => {
  const include = {
    transactions: {
      orderBy: { order: "asc" as const },
    },
    social_options: true,
    checklist_items: true,
    approval_options: {
      include: {
        transactions: {
          orderBy: { order: "asc" as const },
        },
      },
    },
  };
  const draftProposal = await prismaWeb2Client.proposalDraft.findUnique({
    where: { uuid },
    include,
  });
  return draftProposal as DraftProposal;
};

export const getDraftProposalByUuid = async (uuid: string) =>
  getDraftProposalByUuidInternal(uuid);
export const fetchDraftProposalByUuid = cache(getDraftProposalByUuidInternal);
