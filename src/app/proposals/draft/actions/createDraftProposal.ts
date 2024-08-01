"use server";

import { z } from "zod";
import prisma from "@/app/lib/prisma";
import { ProposalType } from "../types";
import { DraftProposalSchema } from "../schemas/DraftProposalSchema";
import { ProposalDraftTransaction } from "@prisma/client";
import {
  getStageByIndex,
  getStageIndexForTenant,
} from "@/app/proposals/draft/utils/stages";

export type FormState = {
  ok: boolean;
  message: string;
};

const formDataByType = (
  data: z.output<typeof DraftProposalSchema>,
  id: number
) => {
  switch (data.type) {
    case ProposalType.BASIC:
      return {
        transactions: {
          // deletes old transactions so we aren't stacking on top of old transactions
          deleteMany: {},
          create: data.transactions.map((transaction, idx) => {
            const asTransaction = {
              order: idx,
              target: transaction.target as string,
              value: transaction.value,
              calldata: transaction.calldata,
              description: transaction.description,
              simulation_state: transaction.simulation_state,
              simulation_id: transaction.simulation_id,
            } as ProposalDraftTransaction;
            return asTransaction;
          }),
        },
      };

    case ProposalType.SOCIAL:
      return {
        proposal_social_type: data.socialProposal?.type,
        start_date_social: data.socialProposal?.start_date
          ? new Date(data.socialProposal.start_date)
          : null,
        end_date_social: data.socialProposal?.end_date
          ? new Date(data.socialProposal.end_date)
          : null,
        social_options: {
          // deletes all existing options so we aren't stacking on top of old options
          deleteMany: {},
          create: data.socialProposal?.options.map((option) => {
            return {
              text: option.text,
            };
          }),
        },
      };

    case ProposalType.APPROVAL:
      return {
        criteria: data.approvalProposal.criteria,
        threshold: data.approvalProposal.threshold
          ? parseInt(data.approvalProposal.threshold)
          : null,
        budget: parseInt(data.approvalProposal.budget),
        max_options: data.approvalProposal.maxOptions
          ? parseInt(data.approvalProposal.maxOptions)
          : null,
        top_choices: data.approvalProposal.topChoices
          ? parseInt(data.approvalProposal.topChoices)
          : null,
        approval_options: {
          // deletes all existing options so we aren't stacking on top of old options
          // TODO: do we need to make sure deletes cascade and remove transactions?
          deleteMany: {},
          create: data.approvalProposal.options.map((option) => {
            return {
              title: option.title,
              transactions: {
                create: option.transactions.map((transaction, idx) => {
                  const asTransaction = {
                    order: idx,
                    target: transaction.target as string,
                    value: transaction.value,
                    calldata: transaction.calldata,
                    description: transaction.description,
                    simulation_state: transaction.simulation_state,
                    simulation_id: transaction.simulation_id,
                    proposal: { connect: { id } },
                  };
                  return asTransaction;
                }),
              },
            };
          }),
        },
      };

    case ProposalType.OPTIMISTIC:
      // nothing specific to optimistic
      return;
  }
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

  const currentIndex = getStageIndexForTenant("DRAFTING") as number;

  try {
    const nextStage = getStageByIndex(currentIndex + 1);

    const baseformData = {
      stage: nextStage?.stage,
      title: parsed.data.title,
      abstract: parsed.data.abstract,
      proposal_type: parsed.data.type,
      proposal_config_type: parsed.data.proposalConfigType,
    };

    const updateDraft = prisma.proposalDraft.update({
      where: {
        id: data.draftProposalId,
      },
      data: {
        ...baseformData,
        ...formDataByType(parsed.data, data.draftProposalId),
      },
    });

    const additionalDatabaseWrites = [];

    if ("transactions" in data && data.transactions.length > 0) {
      const transactionLink = `https://tdly.co/shared/simulation/${data.transactions[0].simulation_id}`;
      const updateTransactionSimulationChecklist =
        prisma.proposalChecklist.create({
          data: {
            title: "Transactions simulated",
            completed_by: data.creatorAddress,
            link: transactionLink,
            proposal: {
              connect: {
                id: data.draftProposalId,
              },
            },
          },
        });

      additionalDatabaseWrites.push(updateTransactionSimulationChecklist);
    }

    await prisma.$transaction([updateDraft, ...additionalDatabaseWrites]);

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
