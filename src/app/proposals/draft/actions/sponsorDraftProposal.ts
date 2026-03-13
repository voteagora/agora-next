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
import { verifyJwtAndGetAddress } from "./siweAuth";
import Tenant from "@/lib/tenant/tenant";
import type { MiradorTraceContext } from "@/lib/mirador/types";
import { appendServerTraceEvent } from "@/lib/mirador/serverTrace";
import { isSafeOnchainTransactionTrackingEnabled } from "@/lib/safeFeatures";
import { upsertSafeTrackedTransaction } from "@/lib/safeTrackedTransactions.server";
import type { SafeTrackedTransactionSummary } from "@/lib/safeTrackedTransactions";

export async function onSubmitAction(
  data: z.output<typeof SponsorProposalSchema> & {
    draftProposalId: number;
    creatorAddress: string;
    jwt: string;
    safeAddress?: `0x${string}`;
    traceContext?: MiradorTraceContext;
  }
): Promise<
  FormState & { safeProposalPublish?: SafeTrackedTransactionSummary }
> {
  const traceContext = data.traceContext
    ? {
        ...data.traceContext,
        step: "draft_onchain_publish",
        source: "backend" as const,
      }
    : undefined;

  if (!data.jwt) {
    await appendServerTraceEvent({
      traceContext,
      eventName: "draft_publish_auth_failed",
      details: { reason: "missing_auth" },
    });
    return { ok: false, message: "Missing authentication" };
  }
  const jwtAddress = await verifyJwtAndGetAddress(data.jwt);
  if (!jwtAddress) {
    await appendServerTraceEvent({
      traceContext,
      eventName: "draft_publish_auth_failed",
      details: { reason: "invalid_token" },
    });
    return { ok: false, message: "Invalid token" };
  }
  if (jwtAddress.toLowerCase() !== data.creatorAddress.toLowerCase()) {
    await appendServerTraceEvent({
      traceContext,
      eventName: "draft_publish_auth_failed",
      details: { reason: "token_address_mismatch" },
    });
    return { ok: false, message: "Token address mismatch" };
  }

  // Authorization: allow author OR governor manager OR configured offchainProposalCreator (when applicable)
  const draft = await prismaWeb2Client.proposalDraft.findUnique({
    where: { id: data.draftProposalId },
    select: {
      id: true,
      dao_slug: true,
      chain_id: true,
      author_address: true,
      proposal_scope: true,
    },
  });
  if (!draft) {
    await appendServerTraceEvent({
      traceContext,
      eventName: "draft_publish_failed",
      details: { reason: "draft_not_found" },
    });
    return { ok: false, message: "Draft not found" };
  }

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
  } catch {
    // tenant read failed; keep current isAuthorized
  }

  if (!isAuthorized) {
    await appendServerTraceEvent({
      traceContext,
      eventName: "draft_publish_failed",
      details: { reason: "unauthorized" },
    });
    return { ok: false, message: "Unauthorized" };
  }

  const parsed = SponsorProposalSchema.safeParse(data);

  if (!parsed.success) {
    await appendServerTraceEvent({
      traceContext,
      eventName: "draft_publish_failed",
      details: { reason: "invalid_form_data" },
    });
    return {
      ok: false,
      message: "Invalid form data",
    };
  }

  const isHybrid = parsed.data.proposal_scope === ProposalScope.HYBRID;
  const isOffchainSubmission = parsed.data.is_offchain_submission;

  const currentIndex = getStageIndexForTenant("AWAITING_SUBMISSION") as number;

  try {
    await appendServerTraceEvent({
      traceContext,
      eventName: "draft_publish_requested",
      details: {
        draftProposalId: data.draftProposalId,
        isOffchainSubmission,
        proposalScope: parsed.data.proposal_scope,
      },
    });
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

    let safeProposalPublish: SafeTrackedTransactionSummary | undefined;
    if (
      isSafeOnchainTransactionTrackingEnabled() &&
      data.safeAddress &&
      parsed.data.onchain_transaction_hash &&
      !parsed.data.is_offchain_submission
    ) {
      safeProposalPublish = await upsertSafeTrackedTransaction({
        daoSlug: draft.dao_slug,
        kind: "publish_proposal",
        safeAddress: data.safeAddress,
        chainId: draft.chain_id,
        safeTxHash: parsed.data.onchain_transaction_hash as `0x${string}`,
        traceContext,
      });
    }

    await appendServerTraceEvent({
      traceContext,
      eventName: "draft_publish_persisted",
      details: {
        draftProposalId: data.draftProposalId,
        onchainTransactionHash: parsed.data.onchain_transaction_hash ?? null,
      },
    });

    return {
      ok: true,
      message: "Success!",
      safeProposalPublish,
    };
  } catch (error) {
    await appendServerTraceEvent({
      traceContext,
      eventName: "draft_publish_failed",
      details: {
        reason: "draft_update_failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    });
    return {
      ok: false,
      message: "Error sponsoring draft proposal",
    };
  }
}
