"use server";

import { prismaWeb2Client } from "@/app/lib/web2";
import type { FormState } from "@/app/types";
import { verifyOwnerAndSiweForDraft } from "./siweAuth";
import {
  getStageByIndex,
  getStageIndexForTenant,
} from "@/app/proposals/draft/utils/stages";

export async function onSubmitAction(data: {
  link: string;
  draftProposalId: number;
  creatorAddress: string;
  message: string;
  signature: `0x${string}`;
}): Promise<FormState> {
  const ownerCheck = await verifyOwnerAndSiweForDraft(data.draftProposalId, {
    address: data.creatorAddress as `0x${string}`,
    message: data.message,
    signature: data.signature,
  });
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
    console.log(error);
    return {
      ok: false,
      message: "Error saving draft proposal",
    };
  }
}
