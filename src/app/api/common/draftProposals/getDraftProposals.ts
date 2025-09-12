import { prismaWeb2Client } from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";
import { DraftProposal } from "@/app/proposals/draft/types";
import { cache } from "react";

const getDraftProposal = async (idOrUuid: number | string) => {
  const isNumeric =
    typeof idOrUuid === "number" || /^\d+$/.test(String(idOrUuid));
  const include = {
    transactions: true,
    social_options: true,
    checklist_items: true,
    approval_options: {
      include: {
        transactions: true,
      },
    },
  } as const;

  let draftProposal;
  if (isNumeric) {
    draftProposal = await prismaWeb2Client.proposalDraft.findUnique({
      where: {
        id:
          typeof idOrUuid === "number"
            ? idOrUuid
            : parseInt(String(idOrUuid), 10),
      },
      include,
    });
  } else {
    const whereUuid = {
      uuid: String(idOrUuid),
    } as unknown as Prisma.ProposalDraftWhereInput;
    draftProposal = await prismaWeb2Client.proposalDraft.findFirst({
      where: whereUuid,
      include,
    });
  }

  return draftProposal as DraftProposal;
};

export const fetchDraftProposal = cache(getDraftProposal);
