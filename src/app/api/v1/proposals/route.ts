import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getHumanBlockTime } from "@/lib/blockTimes";
import {
  getProposalStatus,
  parseProposalData,
  parseProposalResults,
  getTitleFromProposalDescription,
} from "@/lib/proposalUtils";
import provider from "@/app/lib/provider";
import { paginatePrismaResult } from "@/app/lib/pagination";

export async function GET(request: NextRequest) {
  let page = parseInt(request.nextUrl.searchParams.get("page") ?? "0", 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }
  const pageSize = 4;

  const { meta, data: proposals } = await paginatePrismaResult(
    (skip: number, take: number) =>
      prisma.proposals.findMany({
        take,
        skip,
        orderBy: {
          ordinal: "desc",
        },
      }),
    page,
    pageSize
  );

  console.log(proposals);

  const latestBlock = await provider.getBlock("latest");

  const resolvedProposals = Promise.all(
    proposals.map(async (proposal) => {
      const proposalData = parseProposalData(
        JSON.stringify(proposal.proposal_data || {}),
        proposal.proposal_type as "STANDARD" | "APPROVAL"
      );
      const proposalResutsls = parseProposalResults(
        JSON.stringify(proposal.proposal_results || {}),
        proposalData
      );
      return {
        id: proposal.proposal_id,
        proposer: proposal.proposer,
        created_time: latestBlock
          ? getHumanBlockTime(
              proposal.created_block,
              latestBlock.number,
              latestBlock.timestamp
            )
          : null,
        start_time: latestBlock
          ? getHumanBlockTime(
              proposal.start_block,
              latestBlock.number,
              latestBlock.timestamp
            )
          : null,
        end_time: latestBlock
          ? getHumanBlockTime(
              proposal.end_block,
              latestBlock.number,
              latestBlock.timestamp
            )
          : null,
        markdowntitle: getTitleFromProposalDescription(
          proposal.description || ""
        ),
        proposaData: proposalData.kind,
        proposalResults: proposalResutsls.kind,
        proposalType: proposal.proposal_type,
        status: latestBlock
          ? await getProposalStatus(
              proposal,
              proposalResutsls,
              latestBlock.number
            )
          : null,
      };
    })
  );

  // Build out proposal response
  const response = {
    meta,
    proposals: await resolvedProposals,
  };

  return NextResponse.json(response);
}
