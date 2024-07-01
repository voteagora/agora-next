"use server";

import { z } from "zod";
import { schema as RequestSponsorshipSchema } from "../schemas/requestSponsorshipSchema";
import prisma from "@/app/lib/prisma";

export type FormState = {
  ok: boolean;
  message: string;
};

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
    await prisma.proposalDraft.update({
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
    console.log(error);
    return {
      ok: false,
      message: "Error adding sponsor to proposal.",
    };
  }
}
