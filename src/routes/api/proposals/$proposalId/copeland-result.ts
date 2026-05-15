/*
 * TanStack Start port of src/app/api/proposals/[proposalId]/copeland-result/route.ts.
 * URL: GET /api/proposals/:proposalId/copeland-result
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute(
  "/api/proposals/$proposalId/copeland-result"
)({
  server: {
    handlers: {
      GET: withApiAuth(async ({ params }) => {
        const { fetchProposalUnstableCache } = await import(
          "@/app/api/common/proposals/getProposals"
        );
        const { fetchSnapshotVotesForProposal } = await import(
          "@/app/api/common/votes/getVotes"
        );
        const { calculateCopelandVote } = await import(
          "@/lib/copelandCalculation"
        );
        const { default: Tenant } = await import("@/lib/tenant/tenant");

        const FUNDING_VALUES_PROD = {
          "eth.limo": { ext: 100000, std: 700000, isEligibleFor2Y: true },
          "Lighthouse Labs": { ext: null, std: 300000, isEligibleFor2Y: false },
          PYOR: { ext: null, std: 300000, isEligibleFor2Y: false },
          JustaName: { ext: null, std: 300000, isEligibleFor2Y: false },
          "Ethereum Identity Fnd": {
            ext: 200000,
            std: 500000,
            isEligibleFor2Y: true,
          },
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
          ResolutionProtocol: {
            ext: 100000,
            std: 300000,
            isEligibleFor2Y: false,
          },
          NameWrapper: { ext: null, std: 400000, isEligibleFor2Y: false },
          EthDNS: { ext: 400000, std: 400000, isEligibleFor2Y: false },
          SubgraphIndex: { ext: 300000, std: 400000, isEligibleFor2Y: true },
          MetaResolver: { ext: null, std: 800000, isEligibleFor2Y: true },
          "Ethereum Name Improvers": {
            ext: null,
            std: 300000,
            isEligibleFor2Y: true,
          },
          "A long name foundation": {
            ext: null,
            std: 400000,
            isEligibleFor2Y: false,
          },
        };

        const { isProd } = Tenant.current();
        const FUNDING_VALUES = isProd
          ? FUNDING_VALUES_PROD
          : FUNDING_VALUES_DEV;
        const BUDGET_2Y = 1500000;
        const BUDGET_1Y = 3000000;

        try {
          const [proposal, snapshotVotes] = await Promise.all([
            fetchProposalUnstableCache(params.proposalId),
            fetchSnapshotVotesForProposal({
              proposalId: params.proposalId,
              pagination: { offset: 0, limit: 100000 },
            }),
          ]);

          const result = calculateCopelandVote(
            snapshotVotes.data,
            (proposal.proposalData as { choices: string[] }).choices,
            BUDGET_2Y,
            BUDGET_1Y,
            FUNDING_VALUES
          );

          return Response.json(result);
        } catch (e: unknown) {
          return new Response("Internal server error: " + String(e), {
            status: 500,
          });
        }
      }),
    },
  },
});
