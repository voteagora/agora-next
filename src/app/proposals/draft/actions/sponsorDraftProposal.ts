"use server";

import { z } from "zod";
import { schema as SponsorProposalSchema } from "../schemas/sponsorProposalSchema";
import { prismaWeb2Client } from "@/app/lib/prisma";
import {
  getStageByIndex,
  getStageIndexForTenant,
} from "@/app/proposals/draft/utils/stages";
import { ProposalScope } from "../types";
import type { FormState } from "@/app/types";
import { verifySiwe } from "./siweAuth";
import Tenant from "@/lib/tenant/tenant";
import { getPublicClient } from "@/lib/viem";

export async function onSubmitAction(
  data: z.output<typeof SponsorProposalSchema> & {
    draftProposalId: number;
    creatorAddress: string;
    message: string;
    signature: `0x${string}`;
  }
): Promise<FormState> {
  const isValidSig = await verifySiwe({
    address: data.creatorAddress as `0x${string}`,
    message: data.message,
    signature: data.signature,
  });
  if (!isValidSig) {
    return { ok: false, message: "Invalid signature" };
  }

  // Authorization: allow author OR governor manager OR configured offchainProposalCreator (when applicable)
  const draft = await prismaWeb2Client.proposalDraft.findUnique({
    where: { id: data.draftProposalId },
    select: {
      id: true,
      author_address: true,
      proposal_scope: true,
    },
  });
  if (!draft) return { ok: false, message: "Draft not found" };

  const signer = data.creatorAddress.toLowerCase();
  let isAuthorized = signer === draft.author_address.toLowerCase();

  try {
    const tenant = Tenant.current();
    const offchainToggle = tenant.ui.toggle("proposals/offchain");
    const plmToggle = tenant.ui.toggle("proposal-lifecycle");
    const plmConfig = plmToggle?.config as
      | { offchainProposalCreator?: string[] }
      | undefined;
    const isOffchainScope =
      (draft.proposal_scope || "").toLowerCase() ===
      ProposalScope.OFFCHAIN_ONLY;
    const allowOffchainCreator = Boolean(
      offchainToggle?.enabled &&
        (isOffchainScope || data.is_offchain_submission) &&
        plmConfig?.offchainProposalCreator?.includes(signer)
    );
    if (allowOffchainCreator) {
      isAuthorized = true;
    }

    // Try manager check if still not authorized
    if (!isAuthorized) {
      const publicClient = getPublicClient();
      try {
        // manager() may not exist on all governors; ignore errors
        // @ts-expect-error ABI may not include manager in all tenants
        const manager: string = await publicClient.readContract({
          address: tenant.contracts.governor.address as `0x${string}`,
          abi: tenant.contracts.governor.abi,
          functionName: "manager",
          args: [],
        });
        if (manager && manager.toLowerCase() === signer) {
          isAuthorized = true;
        }
      } catch {
        // manager() may not exist; ignore
      }
    }
  } catch {
    // tenant read failed; keep current isAuthorized
  }

  if (!isAuthorized) {
    return { ok: false, message: "Unauthorized" };
  }

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
