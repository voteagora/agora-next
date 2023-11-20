import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  const delegates = await prisma.delegates.findMany({
    take: 100,
    orderBy: {
      voting_power: "desc",
    },
  });

  // Build out proposal response
  const response = {
    delegates: delegates.map((delegate) => ({
      address: delegate.delegate,
      votingPower: delegate.voting_power?.toFixed(),
    })),
  };

  return NextResponse.json(response);
}
