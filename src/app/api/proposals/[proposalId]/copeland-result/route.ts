import { NextRequest, NextResponse } from "next/server";
import { fetchProposalUnstableCache } from "@/app/api/common/proposals/getProposals";
import { fetchSnapshotVotesForProposal } from "@/app/api/common/votes/getVotes";
import { calculateCopelandVote } from "@/lib/copelandCalculation";
import { ParsedProposalData } from "@/lib/proposalUtils";

const FUNDING_VALUES = {
  "Eth Limo": { ext: 800000, std: 700000, isEligibleFor2Y: true },
  "Lighthouse Labs": { ext: null, std: 400000, isEligibleFor2Y: false },
  "PYOR": { ext: null, std: 300000, isEligibleFor2Y: false },
  "JustaName": { ext: 600000, std: 400000, isEligibleFor2Y: false },
  "Ethereum Identity Foundation": { ext: 700000, std: 500000, isEligibleFor2Y: true },
  "Agora": { ext: 400000, std: 300000, isEligibleFor2Y: false },
  "Alpha Growth": { ext: 800000, std: 400000, isEligibleFor2Y: false },
  "web3bio": { ext: null, std: 500000, isEligibleFor2Y: false },
  "GovPal": { ext: null, std: 300000, isEligibleFor2Y: false },
  "dWeb.host": { ext: 400000, std: 300000, isEligibleFor2Y: false },
  "Namespace": { ext: 700000, std: 500000, isEligibleFor2Y: true },
  "ZK Email": { ext: 800000, std: 400000, isEligibleFor2Y: false },
  "Namestone": { ext: null, std: 800000, isEligibleFor2Y: true },
  "Blockful": { ext: 700000, std: 400000, isEligibleFor2Y: false },
  "x23.ai": { ext: null, std: 300000, isEligibleFor2Y: false },
  "Unicorn.eth": { ext: null, std: 300000, isEligibleFor2Y: true },
  "WebHash": { ext: null, std: 300000, isEligibleFor2Y: false },
  "Curia Lab": { ext: null, std: 300000, isEligibleFor2Y: false },
  "Enscribe, Web3 Labs": { ext: null, std: 400000, isEligibleFor2Y: false },
  "Wildcard Labs": { ext: 400000, std: 300000, isEligibleFor2Y: false },
  "Unruggable": { ext: 700000, std: 400000, isEligibleFor2Y: true },
  "Tally": { ext: null, std: 300000, isEligibleFor2Y: false }
} as const;

// Total budget of $4.5M for 12 months
const TOTAL_BUDGET = 4500000;

export async function GET(
  request: NextRequest,
  route: { params: { proposalId: string } }
) {
  try {
    const [proposal, snapshotVotes] = await Promise.all([
      fetchProposalUnstableCache(route.params.proposalId),
      fetchSnapshotVotesForProposal({
        proposalId: route.params.proposalId,
        pagination: {
          offset: 0,
          limit: 100000,
        },
      }),
    ]);
    const result = calculateCopelandVote(
      snapshotVotes.data,
      (
        proposal.proposalData as unknown as ParsedProposalData["SNAPSHOT"]["kind"]
      ).choices,
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
