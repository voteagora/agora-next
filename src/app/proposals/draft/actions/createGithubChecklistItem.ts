"use server";

import prisma from "@/app/lib/prisma";
import { ProposalStage } from "@prisma/client";

export type FormState = {
  ok: boolean;
  message: string;
};

export async function onSubmitAction(data: {
  link: string;
  draftProposalId: number;
  creatorAddress: string;
}): Promise<FormState> {
  try {
    const updateDraft = prisma.proposalDraft.update({
      where: {
        id: data.draftProposalId,
      },
      data: {
        stage: ProposalStage.AWAITING_SUBMISSION,
      },
    });

    const updateChecklist = prisma.proposalChecklist.create({
      data: {
        title: "Docs updated",
        completed_by: data.creatorAddress,
        link: data.link,
        proposal: {
          connect: {
            id: data.draftProposalId,
          },
        },
      },
    });

    await prisma.$transaction([updateDraft, updateChecklist]);

    return {
      ok: true,
      message: "Success!",
    };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      message: "Error saving draft proposal",
    };
  }
}
