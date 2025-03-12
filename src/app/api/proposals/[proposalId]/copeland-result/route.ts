import { NextRequest, NextResponse } from "next/server";
import { fetchProposalUnstableCache } from "@/app/api/common/proposals/getProposals";
import { fetchSnapshotVotesForProposal } from "@/app/api/common/votes/getVotes";
import { calculateCopelandVote } from "@/lib/copelandCalculation";
import { ParsedProposalData } from "@/lib/proposalUtils";
export async function GET(
  request: NextRequest,
  route: { params: { proposalId: string } }
) {
  try {
    const proposal = await fetchProposalUnstableCache(route.params.proposalId);
    const snapshotVotes = await fetchSnapshotVotesForProposal({
      proposalId: route.params.proposalId,
      pagination: {
        offset: 0,
        limit: 100000,
      },
    });
    const result = calculateCopelandVote(
      snapshotVotes.data,
      (
        proposal.proposalData as unknown as ParsedProposalData["SNAPSHOT"]["kind"]
      ).choices
    );
    return NextResponse.json(result);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
