/*
 * TanStack Start port of src/app/api/analytics/vote/route.ts.
 * URL: GET /api/analytics/vote
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/analytics/vote")({
  server: {
    handlers: {
      GET: withApiAuth(async ({ request }) => {
        const { authenticateApiUser } = await import(
          "@/app/lib/auth/serverAuth"
        );
        const { apiFetchProposalVoteCounts } = await import(
          "@/app/api/analytics/vote/getProposalVoteCounts"
        );

        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        try {
          const communityInfo = await apiFetchProposalVoteCounts();
          return Response.json(communityInfo);
        } catch (e: unknown) {
          return new Response("Internal server error: " + String(e), {
            status: 500,
          });
        }
      }),
    },
  },
});
