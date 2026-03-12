"use client";

import { encodeFunctionData } from "viem";

import { onSubmitAction as sponsorDraftProposal } from "../../draft/actions/sponsorDraftProposal";
import { ProposalScope } from "@/app/proposals/draft/types";
import type { DraftProposal } from "@/app/proposals/draft/types";
import { trackEvent } from "@/lib/analytics";
import {
  closeStoredProposalCreationTrace,
  getProposalCreationTraceContext,
  persistProposalCreationTraceState,
  startFreshProposalCreationTrace,
  startOrResumeProposalCreationTrace,
} from "@/lib/mirador/proposalCreationTrace";
import {
  addMiradorEvent,
  addMiradorTxHint,
  addMiradorTxInputData,
  flushMiradorTrace,
} from "@/lib/mirador/webTrace";
import { getMiradorChainNameFromChainId } from "@/lib/mirador/chains";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types.d";
import { resolveSafeTx } from "@/lib/utils";

export async function prepareDraftOnchainPublishTrace(params: {
  address: `0x${string}`;
  chainId: number;
  functionName: "propose" | "proposeWithModule";
  governorAbi: readonly unknown[];
  inputData: unknown;
  draftProposalId: number;
}) {
  const trace = startFreshProposalCreationTrace({
    branch: "draft_onchain_publish",
    walletAddress: params.address,
    chainId: params.chainId,
  });

  addMiradorEvent(trace, "draft_onchain_publish_requested", {
    draftProposalId: params.draftProposalId,
    functionName: params.functionName,
  });
  addMiradorTxInputData(
    trace,
    encodeFunctionData({
      abi: params.governorAbi as any,
      functionName: params.functionName,
      args: params.inputData as never,
    })
  );
  flushMiradorTrace(trace);

  await persistProposalCreationTraceState(trace, {
    branch: "draft_onchain_publish",
    walletAddress: params.address,
    chainId: params.chainId,
    safeAddress: params.address,
  });
}

export async function handleDraftOnchainPublishResult(params: {
  address: `0x${string}`;
  chainId: number;
  draftProposal: DraftProposal;
  inputData: unknown;
  txHash: `0x${string}`;
  isSafeWallet: boolean;
  getAuthenticationData: (messagePayload: Record<string, unknown>) => Promise<{
    jwt?: string;
    message?: string;
    signature?: `0x${string}`;
  } | null>;
  openDialog: (dialog: any) => void;
}) {
  trackEvent({
    event_name: ANALYTICS_EVENT_NAMES.CREATE_PROPOSAL,
    event_data: {
      transaction_hash: params.txHash,
      uses_plm: true,
      proposal_data: params.inputData,
    },
  });

  const auth = await params.getAuthenticationData({
    action: "sponsorDraft",
    draftProposalId: params.draftProposal.id,
    creatorAddress: params.address,
    timestamp: new Date().toISOString(),
  });
  if (!auth) {
    params.openDialog(null);
    await closeStoredProposalCreationTrace({
      eventName: "draft_onchain_publish_auth_cancelled",
      details: { draftProposalId: params.draftProposal.id },
      reason: "draft_onchain_publish_auth_cancelled",
    });
    return;
  }

  const result = await sponsorDraftProposal({
    draftProposalId: params.draftProposal.id,
    onchain_transaction_hash: params.txHash,
    is_offchain_submission: false,
    proposal_scope: params.draftProposal.proposal_scope,
    creatorAddress: params.address,
    message: auth.message,
    signature: auth.signature,
    jwt: auth.jwt,
    safeAddress: params.isSafeWallet ? params.address : undefined,
    traceContext: getProposalCreationTraceContext(),
  });

  if (!result.ok) {
    params.openDialog(null);
    await closeStoredProposalCreationTrace({
      eventName: "draft_onchain_publish_failed_client",
      details: {
        draftProposalId: params.draftProposal.id,
        message: result.message,
      },
      reason: "draft_onchain_publish_failed",
    });
    throw new Error(result.message);
  }

  if (params.isSafeWallet && result.safeProposalPublish) {
    params.openDialog({
      type: "SAFE_PROPOSAL_PUBLISH_STATUS",
      className: "sm:w-[44rem]",
      params: {
        publish: result.safeProposalPublish,
      },
    });

    void closeStoredProposalCreationTrace({
      eventName: "draft_onchain_safe_tx_handed_off",
      details: {
        draftProposalId: params.draftProposal.id,
        safeTxHash: params.txHash,
      },
      reason: "draft_onchain_safe_tx_handed_off",
    });
    return;
  }

  const trace = startOrResumeProposalCreationTrace({
    branch: "draft_onchain_publish",
    walletAddress: params.address,
    chainId: params.chainId,
  });
  const miradorChain = getMiradorChainNameFromChainId(params.chainId);
  addMiradorEvent(trace, "draft_onchain_tx_hash_received", {
    txHash: params.txHash,
  });
  if (miradorChain) {
    addMiradorTxHint(trace, params.txHash, miradorChain);
  }
  flushMiradorTrace(trace);

  void (async () => {
    try {
      const resolvedTxHash = await resolveSafeTx(
        params.chainId,
        params.txHash,
        1,
        6
      );
      const activeTrace = startOrResumeProposalCreationTrace({
        branch: "draft_onchain_publish",
        walletAddress: params.address,
        chainId: params.chainId,
      });

      if (resolvedTxHash && miradorChain) {
        addMiradorTxHint(activeTrace, resolvedTxHash, miradorChain);
      }
      addMiradorEvent(activeTrace, "draft_onchain_tx_resolved", {
        txHash: resolvedTxHash ?? params.txHash,
      });
      flushMiradorTrace(activeTrace);

      await closeStoredProposalCreationTrace({
        eventName: "draft_onchain_publish_complete",
        details: {
          draftProposalId: params.draftProposal.id,
          txHash: resolvedTxHash ?? params.txHash,
        },
        reason: "draft_onchain_publish_complete",
      });
    } catch (error) {
      await closeStoredProposalCreationTrace({
        eventName: "draft_onchain_publish_complete_unresolved",
        details: {
          draftProposalId: params.draftProposal.id,
          txHash: params.txHash,
          message: error instanceof Error ? error.message : "Unknown error",
        },
        reason: "draft_onchain_publish_complete_unresolved",
      });
    }
  })();

  params.openDialog({
    type: "SPONSOR_ONCHAIN_DRAFT_PROPOSAL",
    params: {
      redirectUrl: "/",
      txHash: params.txHash,
      isHybrid: params.draftProposal.proposal_scope === ProposalScope.HYBRID,
      draftProposal: params.draftProposal,
    },
  });
}
