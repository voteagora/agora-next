"use server";

import { z } from "zod";
import { schema as DraftProposalSchema } from "../schemas/DraftProposalSchema";
import prisma from "@/app/lib/prisma";
import { ProposalDraftTransaction } from "@prisma/client";

export type FormState = {
  ok: boolean;
  message: string;
};

export async function onSubmitAction(
  data: z.output<typeof DraftProposalSchema> & { draftProposalId: number }
): Promise<FormState> {
  const parsed = DraftProposalSchema.safeParse(data);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Invalid form data",
    };
  }

  console.log("okay, we made it past the parsing step");
  console.log(parsed.data);

  try {
    await prisma.proposalDraft.update({
      where: {
        id: data.draftProposalId,
      },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        abstract: parsed.data.abstract,
        proposal_type: parsed.data.type.toLowerCase(),
        transactions: {
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
