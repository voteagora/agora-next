/*
 * TanStack Start port of src/app/api/proposals/[proposalId]/chart/route.ts.
 * URL: GET /api/proposals/:proposalId/chart
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/proposals/$proposalId/chart")({
  server: {
    handlers: {
      GET: withApiAuth(async ({ request, params }) => {
        const { getVotesChart, getSnapshotVotesChart } = await import(
          "@/app/api/proposals/getVotesChart"
        );

        const searchParams = new URL(request.url).searchParams;
        const proposalType = searchParams.get("proposalType");

        try {
          const votes =
            proposalType === "SNAPSHOT"
              ? await getSnapshotVotesChart({ proposalId: params.proposalId })
              : await getVotesChart({ proposalId: params.proposalId });
          return Response.json(votes);
        } catch (e: unknown) {
          return new Response("Internal server error: " + String(e), {
            status: 500,
          });
        }
      }),
    },
  },
});
