/*
 * TanStack Start port of src/app/api/balances/[frequency]/route.ts.
 * URL: GET /api/balances/:frequency
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/balances/$frequency")({
  server: {
    handlers: {
      GET: withApiAuth(async ({ request, params }) => {
        const { authenticateApiUser } = await import(
          "@/app/lib/auth/serverAuth"
        );
        const { apiFetchTreasuryBalanceTS } = await import(
          "@/app/api/balances/[frequency]/getTreasuryBalanceTS"
        );

        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        try {
          const communityInfo = await apiFetchTreasuryBalanceTS(
            params.frequency
          );
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
