import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";
import { paginatePrismaResult } from "@/app/lib/pagination";

export async function GET(request: NextRequest) {
  let page = parseInt(request.nextUrl.searchParams.get("page") ?? "0", 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  const pageSize = 20;
  const seed = Number(
    request.nextUrl.searchParams.get("seed") ?? Math.random()
  );

  const { meta, data: delegates } = await paginatePrismaResult(
    (skip: number, take: number, seed: number) => {
      switch (request.nextUrl.searchParams.get("sort")) {
        case "most_delegators":
          return prisma.delegates.findMany({
            skip,
            take,
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
            OFFSET ${skip}
            LIMIT ${take}; // Fetch one extra record
            `
          );
        default:
          return prisma.delegates.findMany({
            skip,
            take,
            orderBy: {
              voting_power: "desc",
            },
          });
      }
    },
    page,
    pageSize,
    { seed }
  );

  const response = {
    meta,
    delegates: delegates.map((delegate) => ({
      address: delegate.delegate,
      votingPower: delegate.voting_power?.toFixed(),
    })),
  };

  return NextResponse.json(response);
}
