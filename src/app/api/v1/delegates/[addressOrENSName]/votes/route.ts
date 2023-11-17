import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { isAddress } from "viem";
import { resolveENSName } from "@/app/lib/utils";
import {
  getProposalTotalValue,
  parseParams,
  parseProposalType,
  parseSupport,
} from "@/lib/proposalUtils";
import { getHumanBlockTime } from "@/lib/blockTimes";
import provider from "@/app/lib/provider";

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
      const proposalType = parseProposalType(vote.proposal_data ?? "{}");
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
        support: parseSupport(vote.support, proposalType),
        weight: vote.weight,
        reason: vote.reason,
        params: parseParams(vote.params, vote.proposal_data),
        proposalType: proposalType,
        proposalData: vote.proposal_data,
        proposalDescription: vote.prop_description,
        proposalValue: getProposalTotalValue({
          key: proposalType,
          kind: JSON.parse(vote.proposal_data ?? "{}"),
        }),
      };
    }),
  };

  return NextResponse.json(response);
}
