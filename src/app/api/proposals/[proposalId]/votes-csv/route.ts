import { NextRequest, NextResponse } from "next/server";
import { fetchSnapshotVotesForProposal } from "@/app/api/common/votes/getVotes";
import { fetchProposalUnstableCache } from "@/app/api/common/proposals/getProposals";
import { ParsedProposalData } from "@/lib/proposalUtils";

export async function GET(
  request: NextRequest,
  route: { params: Promise<{ proposalId: string }> }
) {
  const { proposalId } = await route.params;
  try {
    const [proposal, snapshotVotes] = await Promise.all([
      fetchProposalUnstableCache(proposalId),
      fetchSnapshotVotesForProposal({
        proposalId,
        pagination: {
          offset: 0,
          limit: 100000,
        },
      }),
    ]);

    const choices = (
      proposal.proposalData as unknown as ParsedProposalData["SNAPSHOT"]["kind"]
    ).choices;

    // Create CSV header
    let csvContent = "Voter Address,Voting Power,Choice Ranking\n";

    // Add each vote to the CSV
    snapshotVotes.data.forEach((vote) => {
      const parsedChoice = vote.choice?.startsWith("[")
        ? JSON.parse(vote.choice)
        : vote.choice;

      // Create a mapping of choice index to option name
      const ranking = (parsedChoice as number[])
        .map((rank) => choices[rank - 1])
        .join(",");

      csvContent += `${vote.address},${vote.votingPower},"${ranking}"\n`;
    });

    // Return CSV file
    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="votes-${proposalId}-${Date.now()}.csv"`,
      },
    });
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
