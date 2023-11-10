import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getHumanBlockTime } from "@/lib/blockTimes";
import { getQuorumForProposal } from "@/lib/proposalUtils";
import provider from "@/app/lib/provider";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export async function GET(request: NextRequest) {
  let page = parseInt(request.nextUrl.searchParams.get("page") ?? "0", 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  const latestBlock = await provider.getBlock("latest");

  const pageSize = 20;
  const total_count = await prisma.proposalsList.count();
  const total_pages = Math.ceil(total_count / pageSize);

  const proposals = await prisma.proposalsList.findMany({
    take: pageSize,
    skip: (page - 1) * pageSize,
  });

  const resolvedProposals = proposals.map((proposal) => {
    return {
      id: proposal.proposal_id,
      proposer: proposal.proposer,
      start_block: proposal.start_block,
      end_block: proposal.end_block,
      start_time: latestBlock
        ? getHumanBlockTime(
            proposal.start_block,
            latestBlock.number,
            latestBlock.timestamp
          )
        : null,
      end_time: latestBlock
        ? getHumanBlockTime(
            proposal.end_block,
            latestBlock.number,
            latestBlock.timestamp
          )
        : null,
      markdowntitle: proposal.description?.replace(/\\n/g, "\n").split("\n")[0],
      proposaData: proposal.proposal_data,
    };
  });

  // Build out proposal response
  const response = {
    meta: {
      current_page: page,
      total_pages: total_pages,
      page_size: pageSize,
      total_count: total_count,
    },
    proposals: resolvedProposals,
  };

  return NextResponse.json(response);
}
