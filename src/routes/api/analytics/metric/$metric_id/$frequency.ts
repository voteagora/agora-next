/*
 * TanStack Start port of src/app/api/analytics/metric/[metric_id]/[frequency]/route.ts.
 * URL: GET /api/analytics/metric/:metric_id/:frequency
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute(
  "/api/analytics/metric/$metric_id/$frequency"
)({
  server: {
    handlers: {
      GET: withApiAuth(async ({ request, params }) => {
        const { authenticateApiUser } = await import(
          "@/app/lib/auth/serverAuth"
        );
        const { apiFetchMetricTS } = await import(
          "@/app/api/analytics/metric/[metric_id]/[frequency]/getMetricsTS"
        );

        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        const { metric_id, frequency } = params;
        try {
          const communityInfo = await apiFetchMetricTS(metric_id, frequency);
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
