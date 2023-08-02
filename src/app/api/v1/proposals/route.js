import { ethers } from "ethers";
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getHumanBlockTime } from "@/lib/blockTimes";
import { authenticateAgoraApiUser } from "src/app/lib/middlewear/authenticateAgoraApiUser";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export async function GET(request) {
  // Check if the session is authenticated first
  const authResponse = authenticateAgoraApiUser(request);
  if (authResponse) {
    return authResponse;
  }

  let page = parseInt(request.nextUrl.searchParams.get("page"), 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  const provider = new ethers.AlchemyProvider(
    "mainnet",
    process.env.NEXT_PUBLIC_ALCHEMY_ID
  );
  const latestBlock = await provider.getBlock("latest");

  const pageSize = 25;
  const total_count = await prisma.proposals.count();
  const total_pages = Math.ceil(total_count / pageSize);

  const proposals = await prisma.proposals.findMany({
    take: pageSize,
    skip: (page - 1) * pageSize,
    orderBy: {
      end_block: "desc",
    },
  });

  // Build out proposal response
  const response = {
    meta: {
      current_page: page,
      total_pages: total_pages,
      page_size: pageSize,
      total_count: total_count,
    },
    proposals: proposals.map((proposal) => ({
      id: proposal.id,
      uuid: proposal.uuid,
      proposer_addr: proposal.proposer_addr,
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
      markdowntitle: proposal.description.replace(/\\n/g, "\n").split("\n")[0],
    })),
  };

  return NextResponse.json(response);
}
