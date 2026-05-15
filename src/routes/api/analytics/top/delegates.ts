/*
 * TanStack Start port of src/app/api/analytics/top/delegates/route.ts.
 * URL: GET /api/analytics/top/delegates
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/analytics/top/delegates")({
  server: {
    handlers: {
      GET: withApiAuth(async ({ request }) => {
        const { authenticateApiUser } = await import(
          "@/app/lib/auth/serverAuth"
        );
        const { apiFetchDelegateWeights } = await import(
          "@/app/api/analytics/top/delegates/getTopDelegateWeighs"
        );

        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        try {
          const weights = await apiFetchDelegateWeights();
          return Response.json(weights);
        } catch (e: unknown) {
          return new Response("Internal server error: " + String(e), {
            status: 500,
          });
        }
      }),
    },
  },
});
