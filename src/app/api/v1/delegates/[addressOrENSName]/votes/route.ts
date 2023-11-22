import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { isAddress } from "viem";
import { resolveENSName } from "@/app/lib/utils";
import provider from "@/app/lib/provider";
import { parseVote } from "@/lib/voteUtils";
import { parseProposalData } from "@/lib/proposalUtils";

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
    votes: delegateVotes.map((vote) => {
      const proposalData = parseProposalData(
        JSON.stringify(vote.proposal_data || {}),
        vote.proposal_type
      );
      return parseVote(vote, proposalData, latestBlock);
    }),
  };

  return NextResponse.json(response);
}
