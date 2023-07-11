import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticateAgoraApiUser } from "src/app/lib/middlewear/authenticateAgoraApiUser";

export async function GET(request, { params }) {
  // Check if the session is authenticated first
  const authResponse = authenticateAgoraApiUser(request);
  if (authResponse) {
    return authResponse;
  }

  const prisma = new PrismaClient();

  const proposal = await prisma.proposals.findFirst({
    where: { uuid: params.proposal_id },
  });

  await prisma.$disconnect();

  // Build out proposal response
  const response = {
    proposal: {
      // Just testing out, not meant for production
      id: proposal.id,
      uuid: proposal.uuid,
      proposer_addr: proposal.proposer_addr,
      token: proposal.token,
      start_block: proposal.start_block,
      end_block: proposal.end_block,
      description: proposal.description,
    },
  };

  return NextResponse.json(response);
}
