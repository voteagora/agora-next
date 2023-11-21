import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const page = request.nextUrl.searchParams.get("page");
  const pageSize = 100;
  const seed = Number(
    request.nextUrl.searchParams.get("seed") ?? Math.random()
  );
  console.log(seed);
  const delegates = await (() => {
    switch (request.nextUrl.searchParams.get("sort")) {
      case "most_delegators":
        return prisma.delegates.findMany({
          skip: (Number(page ?? 1) - 1) * pageSize,
          take: 101,
          orderBy: {
            num_for_delegators: "desc",
          },
        });
      case "weigted_random":
        return prisma.$queryRaw<Prisma.DelegatesGetPayload<true>[]>(
          Prisma.sql`
          SELECT *, setseed(${seed})::Text
          FROM center.delegates
          WHERE voting_power > 0
          ORDER BY -log(random()) / voting_power
          LIMIT ${pageSize};
          `
        );
      default:
        return prisma.delegates.findMany({
          skip: Number(page ?? 1) * pageSize,
          take: 101,
          orderBy: {
            voting_power: "desc",
          },
        });
    }
  })();

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
