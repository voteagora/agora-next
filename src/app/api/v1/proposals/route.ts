import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { parseProposal } from "@/lib/proposalUtils";
import provider from "@/app/lib/provider";
import { paginatePrismaResult } from "@/app/lib/pagination";

export async function GET(request: NextRequest) {
  let page = parseInt(request.nextUrl.searchParams.get("page") ?? "0", 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }
  const pageSize = 4;

  const { meta, data: proposals } = await paginatePrismaResult(
    (skip: number, take: number) =>
      prisma.proposals.findMany({
        take,
        skip,
        orderBy: {
          ordinal: "desc",
        },
      }),
    page,
    pageSize
  );

  const latestBlock = await provider.getBlock("latest");

  const resolvedProposals = Promise.all(
    proposals.map((proposal) => parseProposal(proposal, latestBlock))
  );

  // Build out proposal response
  const response = {
    meta,
    proposals: await resolvedProposals,
  };

  return NextResponse.json(response);
}
