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

  let page = parseInt(request.nextUrl.searchParams.get("page"), 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  const pageSize = 50;
  const total_count = await prisma.proposals.count();
  const total_pages = Math.ceil(total_count / pageSize);

  const votes = await prisma.votes.findMany({
    where: { proposal_id: params.proposal_id },
    take: pageSize,
    skip: (page - 1) * pageSize,
  });

  await prisma.$disconnect();

  // Build out proposal response
  const response = {
    meta: {
      current_page: page,
      total_pages: total_pages,
      page_size: pageSize,
      total_count: total_count,
    },
    votes: votes.map((vote) => ({
      address: vote.address,
      proposal_id: vote.proposal_id,
      support: vote.support,
      amount: vote.amount,
      reason: vote.reason,
    })),
  };

  return NextResponse.json(response);
}
