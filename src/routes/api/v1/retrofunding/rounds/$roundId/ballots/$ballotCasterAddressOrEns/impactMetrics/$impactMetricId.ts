/*
 * TanStack Start port of src/app/api/v1/retrofunding/rounds/[roundId]/ballots/[ballotCasterAddressOrEns]/impactMetrics/[impactMetricId]/route.ts.
 * URL: DELETE /api/v1/retrofunding/rounds/:roundId/ballots/:ballotCasterAddressOrEns/impactMetrics/:impactMetricId
 */

import { createFileRoute } from "@tanstack/react-router";

import { traceWithUserId } from "@/lib/apiUtils";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute(
  "/api/v1/retrofunding/rounds/$roundId/ballots/$ballotCasterAddressOrEns/impactMetrics/$impactMetricId"
)({
  server: {
    handlers: {
      DELETE: withApiAuth(async ({ request, params }) => {
        const { authenticateApiUser, validateAddressScope } = await import(
          "@/app/lib/auth/serverAuth"
        );
        const { deleteBallotMetric } = await import(
          "@/app/api/common/ballots/updateBallot"
        );

        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        const { roundId, ballotCasterAddressOrEns, impactMetricId } = params;
        const scopeError = await validateAddressScope(
          ballotCasterAddressOrEns,
          authResponse
        );
        if (scopeError) return scopeError;

        return traceWithUserId(authResponse.userId as string, async () => {
          try {
            await deleteBallotMetric(
              impactMetricId,
              Number(roundId),
              ballotCasterAddressOrEns
            );
            return Response.json({ success: true });
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
