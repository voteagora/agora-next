/*
 * TanStack Start port of src/app/api/v1/retrofunding/rounds/[roundId]/impactMetrics/[impactMetricId]/[addressOrENSName]/route.ts.
 * URL: POST /api/v1/retrofunding/rounds/:roundId/impactMetrics/:impactMetricId/:addressOrENSName
 */

import { createFileRoute } from "@tanstack/react-router";

import { traceWithUserId } from "@/lib/apiUtils";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute(
  "/api/v1/retrofunding/rounds/$roundId/impactMetrics/$impactMetricId/$addressOrENSName"
)({
  server: {
    handlers: {
      POST: withApiAuth(async ({ request, params }) => {
        const { authenticateApiUser, validateAddressScope } = await import(
          "@/app/lib/auth/serverAuth"
        );
        const { viewImpactMetricApi } = await import(
          "@/app/api/common/impactMetrics/viewImactMetric"
        );

        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        const { addressOrENSName, impactMetricId } = params;
        const scopeError = await validateAddressScope(
          addressOrENSName,
          authResponse
        );
        if (scopeError) return scopeError;

        return traceWithUserId(authResponse.userId as string, async () => {
          try {
            const view = await viewImpactMetricApi({
              addressOrENSName,
              metricId: impactMetricId,
            });
            return Response.json(view);
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
