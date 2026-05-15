/*
 * TanStack Start port of src/app/api/v1/votable_supply/route.ts.
 * Excluded from bearer-token auth.
 *
 * URL: GET /api/v1/votable_supply
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/v1/votable_supply")({
  server: {
    handlers: {
      GET: withApiAuth(
        async () => {
          const { fetchVotableSupply } = await import(
            "@/app/api/common/votableSupply/getVotableSupply"
          );
          try {
            const votable_supply = await fetchVotableSupply();
            return Response.json({ votable_supply });
          } catch (e: any) {
            return new Response("Internal server error: " + e.toString(), {
              status: 500,
            });
          }
        },
        { skipAuth: true }
      ),
    },
  },
});
