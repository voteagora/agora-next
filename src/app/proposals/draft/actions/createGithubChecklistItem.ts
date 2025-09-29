"use server";

import { prismaWeb2Client } from "@/app/lib/prisma";
import {
  getStageByIndex,
  getStageIndexForTenant,
} from "@/app/proposals/draft/utils/stages";
import type { FormState } from "../types";

export async function onSubmitAction(data: {
  link: string;
  draftProposalId: number;
  creatorAddress: string;
}): Promise<FormState> {
  const currentIndex = getStageIndexForTenant("ADDING_GITHUB_PR") as number;
  try {
    const nextStage = getStageByIndex(currentIndex + 1);
    const updateDraft = prismaWeb2Client.proposalDraft.update({
      where: {
        id: data.draftProposalId,
      },
      data: {
        stage: nextStage?.stage,
      },
    });

    const updateChecklist = prismaWeb2Client.proposalChecklist.create({
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

    await prismaWeb2Client.$transaction([updateDraft, updateChecklist]);

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
