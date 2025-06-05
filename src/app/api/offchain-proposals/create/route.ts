import { type NextRequest, NextResponse } from "next/server";
import Tenant from "@/lib/tenant/tenant";
import { prismaWeb2Client } from "@/app/lib/prisma";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENT_NAMES, ProposalType } from "@/lib/types.d";
import { getPublicClient } from "@/lib/viem";
import { generateProposalId } from "@/lib/seatbelt/simulate";

interface OffchainProposalRequestBody {
  proposalData: {
    proposer: string;
    description: string;
    choices: string[];
    proposal_type_id: number;
    start_block: string;
    end_block: string;
    proposal_type: ProposalType;
    tiers: number[];
  };
  id: bigint;
  transactionHash: string;
  onchainProposalId: bigint;
}

export async function POST(request: NextRequest) {
  const { slug, contracts } = Tenant.current();
  const governor = contracts.governor.address as `0x${string}`;
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  let requestBody: OffchainProposalRequestBody;
  try {
    requestBody = await request.json();
  } catch (e) {
    return new Response("Invalid request body: " + (e as Error).message, {
      status: 400,
    });
  }

  const { proposalData, onchainProposalId, id, transactionHash } = requestBody;
  const {
    proposer,
    description,
    choices,
    proposal_type_id,
    start_block,
    end_block,
    proposal_type,
    tiers,
  } = proposalData;

  try {
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
        created_attestation_hash: transactionHash,
        created_block: latestBlock,
      },
    });

    trackEvent({
      event_name: ANALYTICS_EVENT_NAMES.CREATE_OFFCHAIN_PROPOSAL,
      event_data: {
        proposal_id: id.toString(),
      },
    });

    return NextResponse.json({
      success: true,
      proposalId: dbProposal.id,
      transactionHash,
    });
  } catch (e: any) {
    console.error("Error creating off-chain proposal attestation:", e);
    if (e.message && e.message.includes("invalid signature string")) {
      return new Response("Invalid signature format provided.", {
        status: 400,
      });
    }
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
