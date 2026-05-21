/*
 * TanStack Start port of src/app/api/v1/retrofunding/rounds/[roundId]/ballots/[ballotCasterAddressOrEns]/route.ts.
 * URL: GET /api/v1/retrofunding/rounds/:roundId/ballots/:ballotCasterAddressOrEns
 */

import { createFileRoute } from "@tanstack/react-router";

import { traceWithUserId } from "@/lib/apiUtils";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute(
  "/api/v1/retrofunding/rounds/$roundId/ballots/$ballotCasterAddressOrEns"
)({
  server: {
    handlers: {
      GET: withApiAuth(async ({ request, params }) => {
        const { authenticateApiUser, getCategoryScope, validateAddressScope } =
          await import("@/lib/auth/serverAuth");
        const { fetchBallot } = await import(
          "@/app/api/common/ballots/getBallots"
        );

        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        const { roundId, ballotCasterAddressOrEns } = params;
        const scopeError = await validateAddressScope(
          ballotCasterAddressOrEns,
          authResponse
        );
        if (scopeError) return scopeError;

        return traceWithUserId(authResponse.userId as string, async () => {
          try {
            const categoryScope = getCategoryScope(authResponse);
            if (!categoryScope) {
              return new Response(
                "This user does not have a category scope. Regenerate the JWT token",
                { status: 401 }
              );
            }
            const ballots = await fetchBallot(
              Number(roundId),
              ballotCasterAddressOrEns,
              categoryScope
            );
            return Response.json(ballots);
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
