import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { isAddress } from "viem";
import { resolveENSName } from "@/app/lib/utils";
import {
  getProposalTotalValue,
  parseProposalData,
  parseSupport,
} from "@/lib/proposalUtils";
import { getHumanBlockTime } from "@/lib/blockTimes";
import provider from "@/app/lib/provider";
import { parseParams } from "@/lib/voteUtils";

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
      return {
        timestamp: latestBlock
          ? getHumanBlockTime(
              vote.block_number,
              latestBlock.number,
              latestBlock.timestamp
            )
          : null,
        address: vote.voter,
        proposal_id: vote.proposal_id,
        support: parseSupport(vote.support, vote.proposal_type),
        weight: vote.weight,
        reason: vote.reason,
        params: parseParams(vote.params, proposalData),
        proposalType: vote.proposal_type,
        proposalData: vote.proposal_data,
        proposalDescription: vote.description,
        proposalValue: getProposalTotalValue(proposalData),
      };
    }),
  };

  return NextResponse.json(response);
}
