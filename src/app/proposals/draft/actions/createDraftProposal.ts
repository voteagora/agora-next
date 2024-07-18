"use server";

import { z } from "zod";
import { schema as DraftProposalSchema } from "../schemas/DraftProposalSchema";
import prisma from "@/app/lib/prisma";
import { ProposalDraftTransaction, ProposalStage } from "@prisma/client";
import Tenant from "@/lib/tenant/tenant";

export type FormState = {
  ok: boolean;
  message: string;
};

export async function onSubmitAction(
  data: z.output<typeof DraftProposalSchema> & {
    draftProposalId: number;
    creatorAddress: string;
  }
): Promise<FormState> {
  const parsed = DraftProposalSchema.safeParse(data);

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
        stage: ProposalStage.ADDING_GITHUB_PR,
        title: parsed.data.title,
        abstract: parsed.data.abstract,
        proposal_type: parsed.data.type,
        proposal_social_type: parsed.data.socialProposal?.type,
        transactions: {
          // deletes old transactions so we aren't stacking on top of old transactions
          deleteMany: {},
          create: parsed.data.transactions.map((transaction, idx) => {
            const asTransaction = {
              order: idx,
              target: transaction.target,
              value: transaction.value,
              calldata: transaction.calldata,
              description: transaction.description,
              simulation_state: transaction.simulation_state,
              simulation_id: transaction.simulation_id,
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

    const transactionLink =
      data.transactions.length > 0
        ? `https://tdly.co/shared/simulation/${data.transactions[0].simulation_id}`
        : "";

    await prisma.$transaction([
      updateDraft,
      prisma.proposalChecklist.create({
        data: {
          title: "Transactions simulated",
          completed_by: data.creatorAddress,
          ...(data.transactions.length > 0 && { link: transactionLink }),
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
