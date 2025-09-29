"use server";

import { z } from "zod";
import { schema as RequestSponsorshipSchema } from "../schemas/requestSponsorshipSchema";
import { prismaWeb2Client } from "@/app/lib/prisma";
import type { FormState } from "../types";

export async function onSubmitAction(
  data: z.output<typeof RequestSponsorshipSchema> & { draftProposalId: number }
): Promise<FormState> {
  const parsed = RequestSponsorshipSchema.safeParse(data);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Invalid form data",
    };
  }

  try {
    await prismaWeb2Client.proposalDraft.update({
      where: {
        id: data.draftProposalId,
      },
      data: {
        sponsor_address: parsed.data.sponsor_address,
      },
    });

    return {
      ok: true,
      message: "Success!",
    };
  } catch (error) {
    return {
      ok: false,
      message: "Error adding sponsor to proposal.",
    };
  }
}
