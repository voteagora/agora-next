import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { isAddress } from "viem";
import { resolveENSName } from "@/app/lib/utils";
import provider from "@/app/lib/provider";
import { parseVotes } from "@/lib/voteUtils";

export async function GET(
  request: NextRequest,
  { params: { addressOrENSName } }: { params: { addressOrENSName: string } }
) {
  let address = isAddress(addressOrENSName)
    ? addressOrENSName.toLowerCase()
    : await resolveENSName(addressOrENSName);

  const delegateVotes = await prisma.votes.findMany({
    where: { voter: address },
  });

  const latestBlock = await provider.getBlock("latest");

  // Build out proposal response
  const response = {
    votes: parseVotes(delegateVotes, latestBlock),
  };

  return NextResponse.json(response);
}
