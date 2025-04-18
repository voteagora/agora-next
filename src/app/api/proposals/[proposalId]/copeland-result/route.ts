import { NextRequest, NextResponse } from "next/server";
import { fetchProposalUnstableCache } from "@/app/api/common/proposals/getProposals";
import { fetchSnapshotVotesForProposal } from "@/app/api/common/votes/getVotes";
import { calculateCopelandVote } from "@/lib/copelandCalculation";
import { ParsedProposalData } from "@/lib/proposalUtils";

const FUNDING_VALUES = {
  EthLimo: { ext: 100000, std: 700000, isEligibleFor2Y: true },
  "Lighthouse Labs": { ext: null, std: 400000, isEligibleFor2Y: false },
  PYOR: { ext: null, std: 300000, isEligibleFor2Y: false },
  JustaName: { ext: 200000, std: 400000, isEligibleFor2Y: false },
  "Ethereum Identity Foundation": {
    ext: 200000,
    std: 500000,
    isEligibleFor2Y: true,
  },
  Agora: { ext: 100000, std: 300000, isEligibleFor2Y: false },
  AlphaGrowth: { ext: 400000, std: 400000, isEligibleFor2Y: false },
  web3bio: { ext: null, std: 500000, isEligibleFor2Y: false },
  GovPal: { ext: null, std: 300000, isEligibleFor2Y: false },
  "dWeb.host": { ext: 100000, std: 300000, isEligibleFor2Y: false },
  Namespace: { ext: 200000, std: 400000, isEligibleFor2Y: true },
  "ZK Email": { ext: 400000, std: 400000, isEligibleFor2Y: false },
  Namestone: { ext: null, std: 800000, isEligibleFor2Y: true },
  Blockful: { ext: 300000, std: 400000, isEligibleFor2Y: false },
  "x23.ai": { ext: null, std: 300000, isEligibleFor2Y: false },
  "Unicorn.eth": { ext: null, std: 300000, isEligibleFor2Y: true },
  WebHash: { ext: null, std: 300000, isEligibleFor2Y: false },
  "Curia Lab": { ext: null, std: 300000, isEligibleFor2Y: false },
  Enscribe: { ext: null, std: 400000, isEligibleFor2Y: false },
  "Wildcard Labs": { ext: 100000, std: 300000, isEligibleFor2Y: false },
  Unruggable: { ext: 300000, std: 400000, isEligibleFor2Y: true },
  Tally: { ext: null, std: 300000, isEligibleFor2Y: false },
  "3DNS": { ext: 200000, std: 500000, isEligibleFor2Y: false },
  "NameHash.Labs": { ext: 200000, std: 1100000, isEligibleFor2Y: false },
  Decent: { ext: null, std: 300000, isEligibleFor2Y: false },
} as const;

// Total budget of $4.5M for 12 months
const BUDGET_2Y = 1500000;
const BUDGET_1Y = 3000000;

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
      BUDGET_2Y,
      BUDGET_1Y,
      FUNDING_VALUES
    );
    return NextResponse.json(result);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
