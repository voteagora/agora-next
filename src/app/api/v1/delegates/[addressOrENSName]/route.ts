import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { resolveENSName } from "@/app/lib/utils";
import { isAddress } from "viem";
import { getCurrentQuorum } from "@/lib/governorUtils";

export async function GET(
  request: NextRequest,
  { params: { addressOrENSName } }: { params: { addressOrENSName: string } }
) {
  const address = isAddress(addressOrENSName)
    ? addressOrENSName
    : await resolveENSName(addressOrENSName);

  const voterStats = await prisma.voterStats.findFirst({
    where: { voter: address },
  });
  const votingPower = await prisma.votingPower.findFirst({
    where: { delegate: address },
  });
  const numOfDelegators = await prisma.numberOfDelegators.findFirst({
    where: { delegate: address },
  });

  const quorum = await getCurrentQuorum("OPTIMISM");

  // Build out delegate JSON response
  const response = {
    delegate: {
      address: address,
      votingPower: votingPower?.voting_power || 0,
      votingPowerRelativeToVotableSupply:
        votingPower?.relative_voting_power || 0,
      votingPowerRelativeToQuorum: Number(
        BigInt(votingPower?.voting_power || 0) / (quorum || 0n)
      ),
      proposalsCreated: voterStats?.proposals_created || 0,
      proposalsVotedOn: voterStats?.proposals_voted || 0,
      votingParticipation: voterStats?.participation_rate || 0,
      lastTenProps: voterStats?.last_10_props || 0,
      numOfDelegators: numOfDelegators?.num_for_delegators || 0,
    },
  };

  return NextResponse.json(response);
}
