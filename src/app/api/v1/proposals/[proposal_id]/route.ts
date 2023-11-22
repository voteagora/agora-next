import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import provider from "@/app/lib/provider";
import { parseProposal } from "@/lib/proposalUtils";

export async function GET(
  request: NextRequest,
  { params }: { params: { proposal_id: string } }
) {
  const latestBlock = await provider.getBlock("latest");

  const proposal = await prisma.proposals.findFirst({
    where: { proposal_id: params.proposal_id },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  // Build out proposal response
  const response = {
    proposal: await parseProposal(proposal, latestBlock),
  };

  return NextResponse.json(response);
}
