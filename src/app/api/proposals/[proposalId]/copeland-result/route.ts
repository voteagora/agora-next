import { NextRequest, NextResponse } from "next/server";
import { fetchProposalUnstableCache } from "@/app/api/common/proposals/getProposals";
import { fetchSnapshotVotesForProposal } from "@/app/api/common/votes/getVotes";
import { calculateCopelandVote } from "@/lib/copelandCalculation";
import { ParsedProposalData } from "@/lib/proposalUtils";
import Tenant from "@/lib/tenant/tenant";

const FUNDING_VALUES_PROD = {
  "eth.limo": { ext: 100000, std: 700000, isEligibleFor2Y: true },
  "Lighthouse Labs": { ext: null, std: 300000, isEligibleFor2Y: false },
  PYOR: { ext: null, std: 300000, isEligibleFor2Y: false },
  JustaName: { ext: null, std: 300000, isEligibleFor2Y: false },
  "Ethereum Identity Fnd": { ext: 200000, std: 500000, isEligibleFor2Y: true },
  Agora: { ext: 100000, std: 300000, isEligibleFor2Y: false },
  AlphaGrowth: { ext: 400000, std: 400000, isEligibleFor2Y: false },
  Web3bio: { ext: null, std: 500000, isEligibleFor2Y: false },
  GovPal: { ext: null, std: 300000, isEligibleFor2Y: false },
  "dWeb.host": { ext: 100000, std: 300000, isEligibleFor2Y: false },
  Namespace: { ext: null, std: 400000, isEligibleFor2Y: true },
  "ZK Email": { ext: 400000, std: 400000, isEligibleFor2Y: false },
  Namestone: { ext: null, std: 800000, isEligibleFor2Y: true },
  blockful: { ext: 100000, std: 700000, isEligibleFor2Y: true },
  "x23.ai": { ext: null, std: 300000, isEligibleFor2Y: false },
  "Unicorn.eth": { ext: null, std: 300000, isEligibleFor2Y: true },
  WebHash: { ext: null, std: 300000, isEligibleFor2Y: false },
  "Curia Lab": { ext: null, std: 300000, isEligibleFor2Y: false },
  Enscribe: { ext: null, std: 400000, isEligibleFor2Y: false },
  "Wildcard Labs": { ext: 100000, std: 300000, isEligibleFor2Y: true },
  Unruggable: { ext: 300000, std: 400000, isEligibleFor2Y: true },
  Tally: { ext: null, std: 300000, isEligibleFor2Y: false },
  "3DNS": { ext: 200000, std: 500000, isEligibleFor2Y: false },
  Decent: { ext: null, std: 300000, isEligibleFor2Y: false },
  "NameHash Labs": { ext: null, std: 1100000, isEligibleFor2Y: true },
} as const;

const FUNDING_VALUES_DEV: Record<
  string,
  { ext: number | null; std: number; isEligibleFor2Y: boolean }
> = {
  ENSRegistry: { ext: null, std: 300000, isEligibleFor2Y: true },
  ResolutionProtocol: { ext: 100000, std: 300000, isEligibleFor2Y: false },
  NameWrapper: { ext: null, std: 400000, isEligibleFor2Y: false },
  EthDNS: { ext: 400000, std: 400000, isEligibleFor2Y: false },
  SubgraphIndex: { ext: 300000, std: 400000, isEligibleFor2Y: true },
  MetaResolver: { ext: null, std: 800000, isEligibleFor2Y: true },
  "Ethereum Name Improvers": { ext: null, std: 300000, isEligibleFor2Y: true },
  "A long name foundation": { ext: null, std: 400000, isEligibleFor2Y: false },
};

const { isMain } = Tenant.current();

const FUNDING_VALUES = isMain ? FUNDING_VALUES_PROD : FUNDING_VALUES_DEV;

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
