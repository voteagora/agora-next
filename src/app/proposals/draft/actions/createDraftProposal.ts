"use server";

import { z } from "zod";
import { schema as DraftProposalSchema } from "../schemas/DraftProposalSchema";
import prisma from "@/app/lib/prisma";
import { ProposalDraftTransaction, ProposalStage } from "@prisma/client";

export type FormState = {
  ok: boolean;
  message: string;
};

export async function onSubmitAction(
  data: z.output<typeof DraftProposalSchema> & { draftProposalId: number }
): Promise<FormState> {
  const parsed = DraftProposalSchema.safeParse(data);

  console.log(parsed);

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
        stage: ProposalStage.READY,
        title: parsed.data.title,
        description: parsed.data.description,
        abstract: parsed.data.abstract,
        proposal_type: parsed.data.type.toLowerCase(),
        transactions: {
          // deletes old transactions so we aren't stacking on top of old transactions
          deleteMany: {},
          create: parsed.data.transactions.map((transaction, idx) => {
            const asTransaction = {
              order: idx,
              target: transaction.target,
              value: transaction.value,
              calldata: transaction.calldata,
              signature: transaction.signature,
              description: transaction.description,
              is_valid: true,
            } as ProposalDraftTransaction;
            return asTransaction;
          }),
        },
        start_date_social: parsed.data.socialProposal?.start_date
          ? new Date(parsed.data.socialProposal.start_date)
          : null,
        end_date_social: parsed.data.socialProposal?.end_date
          ? new Date(parsed.data.socialProposal.end_date)
          : null,
        // if social proposal type, add social options
        ...(parsed.data.socialProposal && {
          social_options: {
            // deletes all existing options so we aren't stacking on top of old options
            deleteMany: {},
            create: parsed.data.socialProposal?.options.map((option) => {
              return {
                text: option.text,
              };
            }),
          },
        }),
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
      message: "Error saving draft proposal",
    };
  }
}
