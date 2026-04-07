"use server";

import { prismaWeb2Client } from "@/app/lib/prisma";
import { PLMConfig } from "@/app/proposals/draft/types";
import { trackEvent } from "@/lib/analytics";
import { verifyAuth, type AuthParams } from "@/lib/auth/authHelpers";
import { appendServerTraceEvent } from "@/lib/mirador/serverTrace";
import { MiradorTraceContext } from "@/lib/mirador/types";
import Tenant from "@/lib/tenant/tenant";
import { ANALYTICS_EVENT_NAMES, ProposalType } from "@/lib/types.d";
import { getPublicClient } from "@/lib/viem";

interface OffchainProposalData {
  proposer: string;
  description: string;
  choices: string[];
  proposal_type_id: number;
  start_block: string;
  end_block: string;
  proposal_type: ProposalType;
  tiers: number[];
  maxApprovals: number;
  criteria: number;
  criteriaValue: number;
  calculationOptions: number;
}

interface CreateOffchainProposalParams {
  auth: AuthParams;
  proposalData: OffchainProposalData;
  id: string;
  attestationUid?: string;
  onchainProposalId: string | null;
  traceContext?: MiradorTraceContext;
}

interface CancelOffchainProposalParams {
  auth: AuthParams;
  proposalId: string;
  attestationUid: string;
  traceContext?: MiradorTraceContext;
}

function getOffchainProposalCreators() {
  const plmConfig = Tenant.current().ui.toggle("proposal-lifecycle")?.config as
    | PLMConfig
    | undefined;
  return plmConfig?.offchainProposalCreator ?? [];
}

function isAllowedOffchainCreator(address: string) {
  const normalizedAddress = address.toLowerCase();
  return getOffchainProposalCreators().some(
    (creator) => creator.toLowerCase() === normalizedAddress
  );
}

export async function createOffchainProposal({
  auth,
  proposalData,
  onchainProposalId,
  id,
  attestationUid,
  traceContext,
}: CreateOffchainProposalParams) {
  try {
    const { slug, contracts } = Tenant.current();
    const authResult = await verifyAuth(
      auth,
      proposalData.proposer as `0x${string}`
    );
    if (!authResult.success) {
      throw new Error(authResult.error);
    }

    if (!isAllowedOffchainCreator(authResult.address)) {
      throw new Error("Unauthorized");
    }

    const latestBlock = await getPublicClient().getBlockNumber();

    const dbProposal = await prismaWeb2Client.offchainProposals.create({
      data: {
        id,
        contract: contracts.governor.address as `0x${string}`,
        onchain_proposalid: onchainProposalId ?? null,
        dao_slug: slug,
        proposer: authResult.address,
        description: proposalData.description,
        choices: proposalData.choices,
        proposal_type_id: proposalData.proposal_type_id.toString(),
        proposal_type: proposalData.proposal_type,
        tiers: proposalData.tiers,
        start_block: proposalData.start_block.toString(),
        end_block: proposalData.end_block.toString(),
        created_attestation_hash: attestationUid ?? null,
        created_block: latestBlock,
        max_options: proposalData.maxApprovals,
        criteria: proposalData.criteria,
        criteria_value: proposalData.criteriaValue,
        calculation_options: proposalData.calculationOptions,
      },
    });

    trackEvent({
      event_name: ANALYTICS_EVENT_NAMES.CREATE_OFFCHAIN_PROPOSAL,
      event_data: {
        proposal_id: id,
      },
    });

    await appendServerTraceEvent({
      traceContext: traceContext
        ? {
            ...traceContext,
            step: "offchain_proposal_record",
            source: "backend",
          }
        : undefined,
      eventName: "offchain_proposal_recorded",
      details: {
        proposalId: dbProposal.id,
        attestationUid: attestationUid ?? null,
      },
    });

    return {
      success: true,
      proposalId: dbProposal.id,
      attestationUid,
    };
  } catch (error: any) {
    console.error("Error creating off-chain proposal:", error);
    await appendServerTraceEvent({
      traceContext: traceContext
        ? {
            ...traceContext,
            step: "offchain_proposal_record",
            source: "backend",
          }
        : undefined,
      eventName: "offchain_proposal_record_failed",
      details: { message: error.message },
    });
    throw new Error("Failed to create off-chain proposal: " + error.message);
  }
}

export async function cancelOffchainProposal({
  auth,
  proposalId,
  attestationUid,
  traceContext,
}: CancelOffchainProposalParams) {
  try {
    const { slug } = Tenant.current();
    const authResult = await verifyAuth(auth);
    if (!authResult.success) {
      throw new Error(authResult.error);
    }

    if (!isAllowedOffchainCreator(authResult.address)) {
      throw new Error("Unauthorized");
    }

    if (!proposalId) {
      throw new Error("Missing proposalId");
    }

    const latestBlock = await getPublicClient().getBlockNumber();

    const updatedProposal = await prismaWeb2Client.offchainProposals.update({
      where: {
        id: proposalId,
        dao_slug: slug,
      },
      data: {
        cancelled_block: latestBlock,
        cancelled_attestation_hash: attestationUid ?? null,
      },
    });

    await appendServerTraceEvent({
      traceContext: traceContext
        ? {
            ...traceContext,
            step: "offchain_proposal_cancel_record",
            source: "backend",
          }
        : undefined,
      eventName: "offchain_proposal_cancel_recorded",
      details: {
        proposalId: updatedProposal.id,
        attestationUid,
      },
    });

    return {
      success: true,
      proposalId: updatedProposal.id,
      attestationUid,
    };
  } catch (error: any) {
    console.error("Error cancelling off-chain proposal:", error);
    await appendServerTraceEvent({
      traceContext: traceContext
        ? {
            ...traceContext,
            step: "offchain_proposal_cancel_record",
            source: "backend",
          }
        : undefined,
      eventName: "offchain_proposal_cancel_record_failed",
      details: { proposalId, message: error.message },
    });
    if (error.code === "P2025") {
      throw new Error(`Off-chain proposal with ID ${proposalId} not found`);
    }
    throw new Error("Failed to cancel off-chain proposal: " + error.message);
  }
}
