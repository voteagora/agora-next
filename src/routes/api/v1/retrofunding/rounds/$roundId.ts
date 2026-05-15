/*
 * TanStack Start port of src/app/api/v1/retrofunding/rounds/[roundId]/route.ts.
 * URL: GET /api/v1/retrofunding/rounds/:roundId
 */

import { createFileRoute } from "@tanstack/react-router";

import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/v1/retrofunding/rounds/$roundId")({
  server: {
    handlers: {
      GET: withApiAuth(async ({ request, params }) => {
        const { authenticateApiUser } = await import(
          "@/app/lib/auth/serverAuth"
        );
        const { fetchRetroFundingRound } = await import(
          "@/app/api/common/rounds/getRetroFundingRounds"
        );

        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        return traceWithUserId(authResponse.userId as string, async () => {
          try {
            const round = await fetchRetroFundingRound(params.roundId);
            return Response.json(round);
          } catch (e: unknown) {
            return new Response("Internal server error: " + String(e), {
              status: 500,
            });
          }
        });
      }),
    },
  },
});
