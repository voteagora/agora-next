import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET(request) {
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
  });

  await prisma.$disconnect();

  // Construct the response
  const response = {
    meta: {
      current_page: page,
      total_pages: total_pages,
      page_size: pageSize,
      total_count: total_count,
    },
    proposals: proposals.map((proposal) => ({
      id: proposal.id,
      uuid: proposal.uuid,
    })),
  };

  return NextResponse.json(response);
}