import { NextResponse } from "next/server";
import { ethers } from "ethers";
import prisma from "@/app/lib/prisma";
import { getHumanBlockTime } from "@/lib/blockTimes";
import { authenticateAgoraApiUser } from "src/app/lib/middlewear/authenticateAgoraApiUser";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export async function GET(request, { params }) {
  // Check if the session is authenticated first
  const authResponse = authenticateAgoraApiUser(request);
  if (authResponse) {
    return authResponse;
  }

  const provider = new ethers.AlchemyProvider(
    "mainnet",
    process.env.NEXT_PUBLIC_ALCHEMY_ID
  );
  const latestBlock = await provider.getBlock("latest");

  const proposal = await prisma.proposals.findFirst({
    where: { uuid: params.proposal_id },
  });

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
      start_time: getHumanBlockTime(
        proposal.start_block,
        latestBlock.number,
        latestBlock.timestamp
      ),
      end_time: getHumanBlockTime(
        proposal.end_block,
        latestBlock.number,
        latestBlock.timestamp
      ),
      description: proposal.description,
    },
  };

  return NextResponse.json(response);
}
