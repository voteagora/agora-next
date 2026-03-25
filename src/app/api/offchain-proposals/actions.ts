"use server";

import Tenant from "@/lib/tenant/tenant";
import { prismaWeb2Client } from "@/app/lib/prisma";
import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENT_NAMES, ProposalType } from "@/lib/types.d";
import { getPublicClient } from "@/lib/viem";
import { verifyAuth, type AuthParams } from "@/lib/auth/authHelpers";
import { PLMConfig } from "@/app/proposals/draft/types";

async function authenticateAndAuthorize(
  auth: AuthParams,
  expectedAddress?: string
): Promise<{ ok: true; address: string } | { ok: false; error: string }> {
  // Verify authentication
  const authResult = await verifyAuth(
    auth,
    expectedAddress as `0x${string}` | undefined
  );
  if (!authResult.success) {
    return { ok: false, error: authResult.error };
  }

  // Check authorization (must be in offchainProposalCreator list)
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");
  const offchainCreators =
    (plmToggle?.config as PLMConfig)?.offchainProposalCreator || [];

  const isAuthorized = offchainCreators.some(
    (creator) => creator.toLowerCase() === authResult.address.toLowerCase()
  );

  if (!isAuthorized) {
    return { ok: false, error: "Unauthorized" };
  }

  return { ok: true, address: authResult.address };
}

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
  proposalData: OffchainProposalData;
  id: string;
  attestationUid?: string;
  onchainProposalId: string | null;
  auth: AuthParams;
}

export async function createOffchainProposal({
  proposalData,
  onchainProposalId,
  id,
  attestationUid,
  auth,
}: CreateOffchainProposalParams) {
  const authResult = await authenticateAndAuthorize(
    auth,
    proposalData.proposer
  );
  if (!authResult.ok) {
    throw new Error(authResult.error);
  }

  try {
    const { slug, contracts } = Tenant.current();
    const governor = contracts.governor.address as `0x${string}`;

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
        created_attestation_hash: attestationUid ?? null,
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

    return {
      success: true,
      proposalId: dbProposal.id,
      attestationUid,
    };
  } catch (error: any) {
    console.error("Error creating off-chain proposal:", error);
    throw new Error("Failed to create off-chain proposal: " + error.message);
  }
}

interface CancelOffchainProposalParams {
  proposalId: string;
  attestationUid: string;
  auth: AuthParams;
}

export async function cancelOffchainProposal({
  proposalId,
  attestationUid,
  auth,
}: CancelOffchainProposalParams) {
  const authResult = await authenticateAndAuthorize(auth, auth.address);
  if (!authResult.ok) {
    throw new Error(authResult.error);
  }

  try {
    const { slug } = Tenant.current();

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

    return {
      success: true,
      proposalId: updatedProposal.id,
      attestationUid,
    };
  } catch (error: any) {
    console.error("Error cancelling off-chain proposal:", error);
    if (error.code === "P2025") {
      throw new Error(`Off-chain proposal with ID ${proposalId} not found`);
    }
    throw new Error("Failed to cancel off-chain proposal: " + error.message);
  }
}
