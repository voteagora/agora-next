import { NextRequest, NextResponse } from "next/server";
import { fetchProposalUnstableCache } from "@/app/api/common/proposals/getProposals";
import { fetchSnapshotVotesForProposal } from "@/app/api/common/votes/getVotes";
import { calculateCopelandVote } from "@/lib/copelandCalculation";
import { ParsedProposalData } from "@/lib/proposalUtils";
import { SnapshotVote } from "@/app/api/common/votes/vote";

const FUNDING_VALUES = {
  Alpha: { ext: 500000, std: 300000, isEligibleFor2Y: true },
  Beta: { ext: 600000, std: 300000, isEligibleFor2Y: true },
  Charlie: { ext: 600000, std: 300000, isEligibleFor2Y: false },
  Delta: { ext: 700000, std: 300000, isEligibleFor2Y: true },
  Echo: { ext: 600000, std: 300000, isEligibleFor2Y: true },
  Fox: { ext: 500000, std: 300000, isEligibleFor2Y: true },
  Gamma: { ext: 400000, std: 300000, isEligibleFor2Y: false },
  Hotel: { ext: 900000, std: 500000, isEligibleFor2Y: true },
  India: { ext: 1200000, std: 700000, isEligibleFor2Y: false },
  Juliet: { ext: 1100000, std: 300000, isEligibleFor2Y: true },
  Kilo: { ext: 1000000, std: 300000, isEligibleFor2Y: false },
  Lima: { ext: 600000, std: 300000, isEligibleFor2Y: true },
} as const;

// Total budget of $4.5M for 12 months
const TOTAL_BUDGET = 4500000;

const options = [
  "Alpha",
  "Beta",
  "Charlie",
  "Delta",
  "Echo",
  "Fox",
  "Gamma",
  "Hotel",
  "India",
  "Juliet",
  "Kilo",
  "Lima",
  "NONE BELOW",
];

function shuffleArray(array: number[]): number[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const HARDCODED_VOTES: SnapshotVote[] = Array.from(
  { length: 50 },
  (_, index) => {
    const shuffledChoices = shuffleArray([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
    ]);

    return {
      id: `vote_${index + 1}`,
      address: `0x${(index + 1).toString(16).padStart(40, "0")}`,
      createdAt: new Date(
        `2024-03-20T${(10 + Math.floor(index / 12)).toString().padStart(2, "0")}:${((index * 5) % 60).toString().padStart(2, "0")}:00Z`
      ),
      choice: JSON.stringify(shuffledChoices),
      votingPower: 1000 + Math.floor(Math.random() * 2500),
      title: `Vote ${index + 1}`,
      reason: [
        "Supporting the ecosystem",
        "Building the future",
        "Community growth",
        "Innovation support",
        "Technical advancement",
      ][Math.floor(Math.random() * 5)],
      choiceLabels: {},
    };
  }
);

export async function GET(
  request: NextRequest,
  route: { params: { proposalId: string } }
) {
  try {
    // const [proposal, snapshotVotes] = await Promise.all([
    //   fetchProposalUnstableCache(route.params.proposalId),
    //   fetchSnapshotVotesForProposal({
    //     proposalId: route.params.proposalId,
    //     pagination: {
    //       offset: 0,
    //       limit: 100000,
    //     },
    //   }),
    // ]);
    const result = calculateCopelandVote(
      HARDCODED_VOTES.slice(0, 10),
      options,
      TOTAL_BUDGET,
      FUNDING_VALUES
    );
    return NextResponse.json(result);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
