import { type NextRequest, NextResponse } from "next/server";
import { prismaWeb2Client } from "@/app/lib/prisma";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types.d";
import { getPublicClient } from "@/lib/viem";
import Tenant from "@/lib/tenant/tenant";

interface OffchainCancelRequestBody {
  proposalId: string;
  transactionHash: string;
}

export async function POST(request: NextRequest) {
  const { slug } = Tenant.current();
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  let requestBody: OffchainCancelRequestBody;
  try {
    requestBody = await request.json();
  } catch (e) {
    return new Response("Invalid request body: " + (e as Error).message, {
      status: 400,
    });
  }

  const { proposalId, transactionHash } = requestBody;

  if (!proposalId || !transactionHash) {
    return new Response("Missing proposalId or transactionHash", {
      status: 400,
    });
  }

  try {
    const latestBlock = await getPublicClient().getBlockNumber();

    const updatedProposal = await prismaWeb2Client.offchainProposals.update({
      where: {
        id: proposalId,
        dao_slug: slug,
      },
      data: {
        cancelled_block: latestBlock,
        cancelled_transaction_hash: transactionHash,
      },
    });

    return NextResponse.json({
      success: true,
      proposalId: updatedProposal.id,
      transactionHash,
    });
  } catch (e: any) {
    console.error("Error cancelling off-chain proposal:", e);
    if (e.code === "P2025") {
      // Prisma error code for record not found
      return new Response(
        `Off-chain proposal with ID ${proposalId} not found for slug ${slug}.`,
        { status: 404 }
      );
    }
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
