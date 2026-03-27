"use server";

import { z } from "zod";
import { schema as tempCheckSchema } from "../schemas/tempCheckSchema";
import { prismaWeb2Client } from "@/app/lib/prisma";
import type { FormState } from "@/app/types";
import { verifyAuth, type AuthParams } from "@/lib/auth/authHelpers";
import {
  getStageByIndex,
  getStageIndexForTenant,
} from "@/app/proposals/draft/utils/stages";
import { requireDraftEditAccess } from "./draftAuthorization";

export async function onSubmitAction(
  data: z.output<typeof tempCheckSchema> & {
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

  const parsed = tempCheckSchema.safeParse(data);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Invalid form data",
    };
  }

  const currentIndex = getStageIndexForTenant("ADDING_TEMP_CHECK") as number;

  try {
    const nextStage = getStageByIndex(currentIndex + 1);

    try {
      await prismaWeb2Client.$transaction([
        prismaWeb2Client.proposalDraft.update({
          where: {
            id: data.draftProposalId,
          },
          data: {
            stage: nextStage?.stage,
            temp_check_link: parsed.data.temp_check_link || "",
          },
        }),
        prismaWeb2Client.proposalChecklist.create({
          data: {
            title: "Temp check",
            completed_by: data.creatorAddress,
            link: parsed.data.temp_check_link,
            proposal: {
              connect: {
                id: data.draftProposalId,
              },
            },
          },
        }),
      ]);

      return {
        ok: true,
        message: `Temp check saved.`,
      };
    } catch (e: any) {
      return {
        ok: false,
        message: e.message,
      };
    }
  } catch (e) {
    return {
      ok: false,
      message: "No step after temp check configured for this tenant.",
    };
  }
}
