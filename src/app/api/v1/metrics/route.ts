import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getCurrentQuorum } from "@/lib/governorUtils";
import { getTokenSupply } from "@/lib/tokenUtils";

export async function GET(request: NextRequest) {
  const votableSupply = await prisma.votableSupply.findFirst({});
  const totalSupply = await getTokenSupply("OPTIMISM");
  const quorum = await getCurrentQuorum("OPTIMISM");

  // Build out delegate JSON response
  const response = {
    votableSupply: votableSupply?.votable_supply || "0",
    totalSupply: totalSupply.toString(),
    quorum: quorum?.toString() || "0",
  };

  return NextResponse.json(response);
}
