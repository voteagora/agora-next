"use server";

import { prismaWeb2Client } from "@/app/lib/prisma";
import type { FormState } from "@/app/types";
import { verifyOwnerAndJwtForDraft } from "./siweAuth";
import {
  getStageByIndex,
  getStageIndexForTenant,
} from "@/app/proposals/draft/utils/stages";

export async function onSubmitAction(data: {
  link: string;
  draftProposalId: number;
  creatorAddress: string;
  jwt: string;
}): Promise<FormState> {
  const ownerCheck = await verifyOwnerAndJwtForDraft(
    data.draftProposalId,
    data.jwt
  );
  if (!ownerCheck.ok) {
    return { ok: false, message: ownerCheck.reason };
  }

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
    return {
      ok: false,
      message: "Error saving draft proposal",
    };
  }
}
