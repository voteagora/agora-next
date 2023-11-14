import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { isAddress } from "viem";
import { resolveENSName } from "@/app/lib/utils";
import { parseParams, parseSupport } from "@/lib/proposalUtils";

export async function GET(
  request: NextRequest,
  { params: { addressOrENSName } }: { params: { addressOrENSName: string } }
) {
  let address = isAddress(addressOrENSName)
    ? addressOrENSName
    : await resolveENSName(addressOrENSName);

  const delegateVotes = await prisma.votes.findMany({
    where: { voter: address },
  });

  // Build out proposal response
  const response = {
    votes: delegateVotes.map((vote) => ({
      address: vote.voter,
      proposal_id: vote.proposal_id,
      support: parseSupport(vote.support, !!vote.params),
      amount: vote.weight,
      reason: vote.reason,
      params: parseParams(vote.params, vote.proposal_data),
    })),
  };

  return NextResponse.json(response);
}
