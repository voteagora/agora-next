"use server";

import { prismaWeb2Client } from "@/app/lib/prisma";
import type { FormState } from "@/app/types";
import { verifyAuth, type AuthParams } from "@/lib/auth/authHelpers";
import {
  getStageByIndex,
  getStageIndexForTenant,
} from "@/app/proposals/draft/utils/stages";
import { requireDraftEditAccess } from "./draftAuthorization";

export async function onSubmitAction(
  data: {
    link: string;
    draftProposalId: number;
    creatorAddress: string;
  } & AuthParams
): Promise<FormState> {
  const authResult = await verifyAuth(
    {
      jwt: data.jwt,
      message: data.message,
      signature: data.signature,
      address: data.creatorAddress as `0x${string}`,
    },
    data.creatorAddress as `0x${string}`
  );
  if (!authResult.success) {
    return { ok: false, message: authResult.error };
  }

  const draftAccess = await requireDraftEditAccess({
    draftProposalId: data.draftProposalId,
    address: authResult.address,
  });
  if (!draftAccess.ok) {
    return { ok: false, message: draftAccess.message };
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
