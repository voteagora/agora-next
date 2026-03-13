"use server";

import Tenant from "@/lib/tenant/tenant";
import { prismaWeb2Client } from "@/app/lib/prisma";
import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENT_NAMES, ProposalType } from "@/lib/types.d";
import { getPublicClient } from "@/lib/viem";
import { appendServerTraceEvent } from "@/lib/mirador/serverTrace";
import { getMiradorChainNameFromChainId } from "@/lib/mirador/chains";
import { MiradorTraceContext } from "@/lib/mirador/types";
import { verifyJwtAndGetAddress } from "@/lib/siweAuth.server";
import { PLMConfig } from "@/app/proposals/draft/types";

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
  authJwt: string;
  proposalData: OffchainProposalData;
  id: string;
  transactionHash?: string;
  onchainProposalId: string | null;
  traceContext?: MiradorTraceContext;
}

export async function createOffchainProposal({
  authJwt,
  proposalData,
  onchainProposalId,
  id,
  transactionHash,
  traceContext,
}: CreateOffchainProposalParams) {
  try {
    const { slug, contracts } = Tenant.current();
    const verifiedAddress = await verifyJwtAndGetAddress(authJwt);
    if (!verifiedAddress) {
      throw new Error("Invalid token");
    }

    const plmConfig = Tenant.current().ui.toggle("proposal-lifecycle")
      ?.config as PLMConfig | undefined;
    const offchainProposalCreator = plmConfig?.offchainProposalCreator ?? [];
    const normalizedVerifiedAddress = verifiedAddress.toLowerCase();
    const isAllowedCreator = offchainProposalCreator.some(
      (creator) => creator.toLowerCase() === normalizedVerifiedAddress
    );
    if (!isAllowedCreator) {
      throw new Error("Unauthorized");
    }

    const governor = contracts.governor.address as `0x${string}`;
    const miradorChain = getMiradorChainNameFromChainId(
      contracts.governor.chain.id
    );

    const {
      proposer,
      description,
      choices,
      proposal_type_id,
      start_block,
      end_block,
      proposal_type,
      tiers,
      maxApprovals,
      criteria,
      criteriaValue,
      calculationOptions,
    } = proposalData;

    if (proposer.toLowerCase() !== normalizedVerifiedAddress) {
      throw new Error("Token address mismatch");
    }

    const latestBlock = await getPublicClient().getBlockNumber();

    const dbProposal = await prismaWeb2Client.offchainProposals.create({
      data: {
        id,
        contract: governor,
        onchain_proposalid: onchainProposalId ?? null,
        dao_slug: slug,
        proposer: proposer,
        description: description,
        choices: choices,
        proposal_type_id: proposal_type_id.toString(),
        proposal_type: proposal_type,
        tiers: tiers,
        start_block: start_block.toString(),
        end_block: end_block.toString(),
        created_attestation_hash: transactionHash ?? null,
        created_block: latestBlock,
        max_options: maxApprovals,
        criteria: criteria,
        criteria_value: criteriaValue,
        calculation_options: calculationOptions,
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
      details: { proposalId: dbProposal.id },
      txHashHints:
        transactionHash && miradorChain
          ? [{ txHash: transactionHash, chain: miradorChain }]
          : undefined,
    });

    return {
      success: true,
      proposalId: dbProposal.id,
      transactionHash,
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

interface CancelOffchainProposalParams {
  authJwt: string;
  proposalId: string;
  transactionHash: string;
}

export async function cancelOffchainProposal({
  authJwt,
  proposalId,
  transactionHash,
}: CancelOffchainProposalParams) {
  try {
    const { slug } = Tenant.current();
    const verifiedAddress = await verifyJwtAndGetAddress(authJwt);
    if (!verifiedAddress) {
      throw new Error("Invalid token");
    }

    const plmConfig = Tenant.current().ui.toggle("proposal-lifecycle")
      ?.config as PLMConfig | undefined;
    const offchainProposalCreator = plmConfig?.offchainProposalCreator ?? [];
    const isAllowedCreator = offchainProposalCreator.some(
      (creator) => creator.toLowerCase() === verifiedAddress.toLowerCase()
    );
    if (!isAllowedCreator) {
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
        cancelled_attestation_hash: transactionHash ?? null,
      },
    });

    return {
      success: true,
      proposalId: updatedProposal.id,
      transactionHash,
    };
  } catch (error: any) {
    console.error("Error cancelling off-chain proposal:", error);
    if (error.code === "P2025") {
      throw new Error(`Off-chain proposal with ID ${proposalId} not found`);
    }
    throw new Error("Failed to cancel off-chain proposal: " + error.message);
  }
}
