"use server";

import { z } from "zod";
import { schema as RequestSponsorshipSchema } from "../schemas/requestSponsorshipSchema";
import prisma from "@/app/lib/prisma";
import {
  getStageByIndex,
  getStageIndexForTenant,
} from "@/app/proposals/draft/utils/stages";
import { Visibility } from "../types";
export type FormState = {
  ok: boolean;
  message: string;
};

export async function onSubmitAction(
  data: z.output<typeof RequestSponsorshipSchema> & { draftProposalId: number }
): Promise<FormState> {
  const parsed = RequestSponsorshipSchema.safeParse(data);

  if (!parsed.success) {
    console.log(parsed.error);
    return {
      ok: false,
      message: "Invalid form data",
    };
  }

  const currentIndex = getStageIndexForTenant("AWAITING_SUBMISSION") as number;

  try {
    const nextStage = getStageByIndex(currentIndex + 1);
    await prisma.proposalDraft.update({
      where: {
        id: data.draftProposalId,
      },
      data: {
        stage: nextStage?.stage,
        is_public: parsed.data.visibility === Visibility.PUBLIC,
        approved_sponsors: {
          upsert: parsed.data.sponsors.map((sponsor) => ({
            where: {
              sponsor_address_proposal_id: {
                sponsor_address: sponsor.address,
                proposal_id: data.draftProposalId,
              },
            },
            update: {},
            create: {
              sponsor_address: sponsor.address,
            },
          })),
        },
      },
    });

    return {
      ok: true,
      message: "Success!",
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      message: "Error adding sponsor to proposal.",
    };
  }
}
