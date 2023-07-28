import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticateAgoraApiUser } from "src/app/lib/middlewear/authenticateAgoraApiUser";

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
  const total_count = await prisma.events.count();
  const total_pages = Math.ceil(total_count / pageSize);

  const delegates = await prisma.address_stats.findMany({
    take: pageSize,
    skip: (page - 1) * pageSize,
    orderBy: {
      total_voting_power: "desc",
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
    delegates: delegates.map((delegate) => ({
      id: delegate.vid,
      address: delegate.account,
      total_voting_power: delegate.total_voting_power,
    })),
  };

  return NextResponse.json(response);
}
