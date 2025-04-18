"use server";

import { z } from "zod";
import { schema as tempCheckSchema } from "../schemas/tempCheckSchema";
import { prismaWeb2Client } from "@/app/lib/prisma";
import {
  getStageByIndex,
  getStageIndexForTenant,
} from "@/app/proposals/draft/utils/stages";

export type FormState = {
  ok: boolean;
  message: string;
};

export async function onSubmitAction(
  data: z.output<typeof tempCheckSchema> & {
    draftProposalId: number;
    creatorAddress: string;
  }
): Promise<FormState> {
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
