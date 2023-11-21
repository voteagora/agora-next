import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  const page = request.nextUrl.searchParams.get("page");
  const pageSize = 100;

  const delegates = await prisma.delegates.findMany({
    skip: Number(page ?? 1) * pageSize,
    take: 101,
    orderBy: {
      voting_power: "desc",
    },
  });

  const hasNextPage = delegates.length > pageSize;

  // Build out proposal response
  const response = {
    meta: {
      currentPage: page,
      pageSize,
      hasNextPage,
    },
    delegates: delegates.map((delegate) => ({
      address: delegate.delegate,
      votingPower: delegate.voting_power?.toFixed(),
    })),
  };

  return NextResponse.json(response);
}
