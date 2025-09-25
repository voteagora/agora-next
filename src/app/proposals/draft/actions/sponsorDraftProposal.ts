"use server";

import { z } from "zod";
import { schema as SponsorProposalSchema } from "../schemas/sponsorProposalSchema";
import { prismaWeb2Client } from "@/app/lib/prisma";
import {
  getStageByIndex,
  getStageIndexForTenant,
} from "@/app/proposals/draft/utils/stages";
import { ProposalScope } from "../types";
import type { FormState } from "../types";

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

  const isHybrid = parsed.data.proposal_scope === ProposalScope.HYBRID;
  const isOffchainSubmission = parsed.data.is_offchain_submission;

  const currentIndex = getStageIndexForTenant("AWAITING_SUBMISSION") as number;

  try {
    const nextStage =
      isHybrid && !isOffchainSubmission
        ? getStageByIndex(currentIndex)
        : getStageByIndex(currentIndex + 1);
    let concatenedTransactionHash = null;
    if (isHybrid && isOffchainSubmission) {
      const alreadyExistingTransactionHash =
        await prismaWeb2Client.proposalDraft.findUnique({
          select: {
            onchain_transaction_hash: true,
          },
          where: {
            id: data.draftProposalId,
          },
        });
      concatenedTransactionHash = `${alreadyExistingTransactionHash?.onchain_transaction_hash},${parsed.data.onchain_transaction_hash}`;
    }
    const updateDraft = prismaWeb2Client.proposalDraft.update({
      where: {
        id: data.draftProposalId,
      },
      data: {
        stage: nextStage?.stage,
        ...(parsed.data.snapshot_link && {
          snapshot_link: parsed.data.snapshot_link,
        }),
        ...(parsed.data.onchain_transaction_hash && {
          onchain_transaction_hash:
            concatenedTransactionHash ?? parsed.data.onchain_transaction_hash,
        }),
      },
    });

    await prismaWeb2Client.$transaction([updateDraft]);

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
