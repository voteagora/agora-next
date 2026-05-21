/*
 * TanStack Start port of src/app/api/v1/relay/route.ts.
 * URL: GET /api/v1/relay
 */

import { createFileRoute } from "@tanstack/react-router";

import { apiFetchRelayStatus } from "@/lib/relay/getRelayStatus";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/v1/relay/")({
  server: {
    handlers: {
      GET: withApiAuth(async () => {
        try {
          const status = await apiFetchRelayStatus();
          return Response.json(status);
        } catch (e: any) {
          return new Response("Internal server error: " + e.toString(), {
            status: 500,
          });
        }
      }),
    },
  },
});
