"use server";

import { z } from "zod";
import { schema as SponsorProposalSchema } from "../schemas/sponsorProposalSchema";
import prisma from "@/app/lib/prisma";
import { ProposalStage } from "@prisma/client";

export type FormState = {
  ok: boolean;
  message: string;
};

export async function onSubmitAction(
  data: z.output<typeof SponsorProposalSchema> & {
    draftProposalId: number;
  }
): Promise<FormState> {
  const parsed = SponsorProposalSchema.safeParse(data);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Invalid form data",
    };
  }

  try {
    const updateDraft = prisma.proposalDraft.update({
      where: {
        id: data.draftProposalId,
      },
      data: {
        // TODO: this shouldn't really be queue...
        // queue is next action we would take but it's more like "ready for voting"
        stage: ProposalStage.PENDING,
        ...(parsed.data.snapshot_link && {
          snapshot_link: parsed.data.snapshot_link,
        }),
        ...(parsed.data.onchain_transaction_hash && {
          onchain_transaction_hash: parsed.data.onchain_transaction_hash,
        }),
      },
    });

    await prisma.$transaction([updateDraft]);

    return {
      ok: true,
      message: "Success!",
    };
  } catch (error) {
    return {
      ok: false,
      message: "Error sponsoring draft proposal",
    };
  }
}
