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
import { verifyAuth, type AuthParams } from "@/lib/auth/authHelpers";
import Tenant from "@/lib/tenant/tenant";
import type { MiradorTraceContext } from "@/lib/mirador/types";
import { appendServerTraceEvent } from "@/lib/mirador/serverTrace";
import { shouldTrackSafeOnchainTransactions } from "@/lib/safeFeatures";
import { upsertSafeTrackedTransaction } from "@/lib/safeTrackedTransactions.server";
import type { SafeTrackedTransactionSummary } from "@/lib/safeTrackedTransactions";
import { getDraftAuthorizationContext } from "./draftAuthorization";

export async function onSubmitAction(
  data: z.output<typeof SponsorProposalSchema> & {
    draftProposalId: number;
    creatorAddress: string;
    safeAddress?: `0x${string}`;
    traceContext?: MiradorTraceContext;
  } & AuthParams
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

  const authResult = await verifyAuth(
    {
      jwt: data.jwt,
      message: data.message,
      signature: data.signature,
      address: data.creatorAddress as `0x${string}`,
    },
    data.creatorAddress as `0x${string}`
  );
  if (!authResult.success) {
    await appendServerTraceEvent({
      traceContext,
      eventName: "draft_publish_auth_failed",
      details: { reason: authResult.error },
    });
    return { ok: false, message: authResult.error };
  }

  const draftAccess = await getDraftAuthorizationContext({
    draftProposalId: data.draftProposalId,
    address: authResult.address,
    includeProposalScope: true,
  });
  if (!draftAccess.ok) {
    await appendServerTraceEvent({
      traceContext,
      eventName: "draft_publish_failed",
      details: {
        reason:
          draftAccess.message === "Draft not found"
            ? "draft_not_found"
            : "unauthorized",
      },
    });
    return { ok: false, message: draftAccess.message };
  }

  const {
    draft,
    normalizedAddress: signer,
    isAuthor,
    isOffchainCreator,
  } = draftAccess.context;
  let isAuthorized = isAuthor;

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
        isOffchainCreator &&
        (isOffchainScope || data.is_offchain_submission) &&
        plmConfig?.offchainProposalCreator?.some(
          (creator) => creator.toLowerCase() === signer
        )
    );
    if (allowOffchainCreator) {
      isAuthorized = true;
    }
  } catch {
    // Tenant config lookup is advisory; keep the author-only decision.
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
      shouldTrackSafeOnchainTransactions(draft.chain_id ?? undefined) &&
      data.safeAddress &&
      parsed.data.onchain_transaction_hash &&
      !parsed.data.is_offchain_submission
    ) {
      safeProposalPublish = await upsertSafeTrackedTransaction({
        daoSlug: draft.dao_slug!,
        kind: "publish_proposal",
        safeAddress: data.safeAddress,
        chainId: draft.chain_id!,
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
