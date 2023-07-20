import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticateAgoraApiUser } from "src/app/lib/middlewear/authenticateAgoraApiUser"

export async function GET(request) {
  
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

  await prisma.$disconnect();

  // Build out proposal response
  const response = {
    meta: {
      current_page: page,
      total_pages: total_pages,
      page_size: pageSize,
      total_count: total_count,
    },
    proposals: proposals.map((proposal) => ({
      // Just testing out, not meant for production
      id: proposal.id,
      uuid: proposal.uuid,
      proposer_addr: proposal.proposer_addr,
      token: proposal.token,
      start_block: proposal.start_block,
      end_block: proposal.end_block,
      description: proposal.description,
    })),
  };

  return NextResponse.json(response);
}