import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { isAddress } from "viem";
import { resolveENSName } from "@/app/lib/utils";
import provider from "@/app/lib/provider";
import { Sort, SortOrder, parseVote } from "@/lib/voteUtils";
import { parseProposalData } from "@/lib/proposalUtils";
import { paginatePrismaResult } from "@/app/lib/pagination";

export async function GET(
  request: NextRequest,
  { params: { addressOrENSName } }: { params: { addressOrENSName: string } }
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
  const address = isAddress(addressOrENSName)
    ? addressOrENSName.toLowerCase()
    : await resolveENSName(addressOrENSName);

  const { meta, data: votes } = await paginatePrismaResult(
    (skip: number, take: number) =>
      prisma.votes.findMany({
        where: { voter: address },
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
      return parseVote(vote, proposalData, latestBlock);
    }),
  };

  return NextResponse.json(response);
}
