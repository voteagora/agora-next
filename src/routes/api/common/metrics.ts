/*
 * TanStack Start port of src/app/api/common/metrics/route.ts.
 * URL: GET /api/common/metrics
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/common/metrics")({
  server: {
    handlers: {
      GET: withApiAuth(async () => {
        const { fetchMetrics } = await import(
          "@/app/api/common/metrics/getMetrics"
        );

        try {
          const metrics = await fetchMetrics();
          return Response.json(metrics);
        } catch (e: unknown) {
          return new Response("Internal server error: " + String(e), {
            status: 500,
          });
        }
      }),
    },
  },
});
