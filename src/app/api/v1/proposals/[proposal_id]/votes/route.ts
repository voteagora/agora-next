import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { proposal_id: string } }
) {
  let page = parseInt(request.nextUrl.searchParams.get("page") ?? "0", 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  const sortByPower = request.nextUrl.searchParams.get("sortByPower");

  const pageSize = 50;
  // TODO: Figure out a better way to paginate
  const total_pages = Math.ceil(10000 / pageSize);

  const votes = await prisma.votes.findMany({
    where: { proposal_id: params.proposal_id },
    take: pageSize,
    skip: (page - 1) * pageSize,
    orderBy: sortByPower
      ? {
          weight: "desc", // or "as" if you want ascending order
        }
      : {
          block_number: "desc", // or "asc" if you want ascending order
        },
  });

  // Build out proposal response
  const response = {
    meta: {
      current_page: page,
      total_pages: total_pages,
      page_size: pageSize,
      total_count: 10000,
    },
    votes: votes.map((vote) => ({
      address: vote.voter,
      proposal_id: vote.proposal_id,
      support: parseSupport(vote.support, !!vote.params),
      amount: vote.weight,
      reason: vote.reason,
      params: parseParams(vote.params, vote.proposal_data),
    })),
  };

  return NextResponse.json(response);
}

function parseSupport(support: string | null, hasParams: boolean) {
  switch (Number(support)) {
    case 0:
      return hasParams ? 1 : -1; // FOR / AGAINST
    case 1:
      return hasParams ? 0 : 1; // ABSTAIN / FOR
    case 2:
      return -1;
  }
}

function parseParams(
  params: string | null,
  proposaData: string | null
): string[] | null {
  if (params === null) {
    return null;
  }

  try {
    const parsedParams = JSON.parse(params);
    const parsedProposalData = JSON.parse(proposaData ?? "[]");
    const proposalOptions = parsedProposalData[0];

    return parsedParams[0].map((param: string) => {
      const idx = Number(param);
      return proposalOptions[idx][3];
    });
  } catch (e) {
    return null;
  }
}
