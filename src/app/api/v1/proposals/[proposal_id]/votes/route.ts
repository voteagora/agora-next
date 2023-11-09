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
  const total_count = await prisma.votes.count({
    where: { proposal_id: params.proposal_id },
  });
  const total_pages = Math.ceil(total_count / pageSize);

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
      total_count: total_count,
    },
    votes: votes.map((vote) => ({
      address: vote.voter,
      proposal_id: vote.proposal_id,
      support: vote.support,
      amount: vote.weight,
      reason: vote.reason,
    })),
  };

  return NextResponse.json(response);
}
