import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { parseProposalData, parseSupport } from "@/lib/proposalUtils";
import provider from "@/app/lib/provider";
import { getHumanBlockTime } from "@/lib/blockTimes";
import { paginatePrismaResult } from "@/app/lib/pagination";
import { parseParams } from "@/lib/voteUtils";

type SortOrder = "asc" | "desc";
type Sort = "weight" | "block_number";

export async function GET(
  request: NextRequest,
  { params }: { params: { proposal_id: string } }
) {
  let page = parseInt(request.nextUrl.searchParams.get("page") ?? "0", 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  const sort: Sort =
    request.nextUrl.searchParams.get("sort") === "weight"
      ? "weight"
      : "block_number";
  const sortOrder: SortOrder =
    request.nextUrl.searchParams.get("sort_order") === "asc" ? "asc" : "desc";
  const pageSize = 25;

  const { meta, data: votes } = await paginatePrismaResult(
    (skip: number, take: number) =>
      prisma.votes.findMany({
        where: { proposal_id: params.proposal_id },
        take,
        skip,
        orderBy: {
          [sort]: sortOrder,
        },
      }),
    page,
    pageSize
  );

  const latestBlock = await provider.getBlock("latest");

  // Build out proposal response
  const response = {
    meta,
    votes: votes.map((vote) => {
      const proposalData = parseProposalData(
        JSON.stringify(vote.proposal_data || {}),
        vote.proposal_type
      );
      return {
        address: vote.voter,
        proposal_id: vote.proposal_id,
        support: parseSupport(vote.support, vote.proposal_type),
        amount: vote.weight,
        reason: vote.reason,
        params: parseParams(vote.params, proposalData),
        timestamp: latestBlock
          ? getHumanBlockTime(
              vote.block_number,
              latestBlock.number,
              latestBlock.timestamp
            )
          : null,
      };
    }),
  };

  return NextResponse.json(response);
}
