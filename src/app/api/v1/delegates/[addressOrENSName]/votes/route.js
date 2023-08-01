import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { authenticateAgoraApiUser } from "src/app/lib/middlewear/authenticateAgoraApiUser";

export async function GET(request, { params }) {
  // Check if the session is authenticated first
  const authResponse = authenticateAgoraApiUser(request);
  if (authResponse) {
    return authResponse;
  }

  // paginate with base 10 the votes for page number
  let page = parseInt(request.nextUrl.searchParams.get("page"), 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  let address = params.addressOrENSName;

  // Check if the param is an Ethereum address
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    // If it's not an Ethereum address,
    // assume it's an ENS name and resolve it to an address
    address = await resolveENSName(address);
  }

  const pageSize = 25;

  const delegateVotes = await prisma.votes.findMany({
    where: { address: address },
    take: pageSize,
    skip: (page - 1) * pageSize,
  });

  const total_count = await prisma.votes.count({ where: { address: address } });

  const total_pages = Math.ceil(total_count / pageSize);

  // Build out proposal response
  const response = {
    meta: {
      current_page: page,
      total_pages: total_pages,
      page_size: pageSize,
      total_count: total_count,
    },
    votes: delegateVotes.map((vote) => ({
      address: vote.address,
      proposal_id: vote.proposal_id,
      support: vote.support,
      amount: vote.amount,
      reason: vote.reason,
    })),
  };

  return NextResponse.json(response);
}
