import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  let page = parseInt(request.nextUrl.searchParams.get("page") ?? "0", 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  const pageSize = 20;
  const seed = Number(
    request.nextUrl.searchParams.get("seed") ?? Math.random()
  );

  const delegates = await (() => {
    switch (request.nextUrl.searchParams.get("sort")) {
      case "most_delegators":
        return prisma.delegates.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize + 1,
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
          OFFSET ${pageSize * (page - 1)}
          LIMIT ${pageSize + 1}; // Fetch one extra record
          `
        );
      default:
        return prisma.delegates.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize + 1,
          orderBy: {
            voting_power: "desc",
          },
        });
    }
  })();

  const hasNextPage = delegates.length > pageSize;

  const theDelegates = delegates.slice(0, pageSize);

  const response = {
    meta: {
      currentPage: page,
      pageSize,
      hasNextPage,
    },
    delegates: theDelegates.map((delegate) => ({
      address: delegate.delegate,
      votingPower: delegate.voting_power?.toFixed(),
    })),
  };

  return NextResponse.json(response);
}
