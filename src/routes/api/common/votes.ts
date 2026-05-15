/*
 * TanStack Start port of src/app/api/common/votes/route.ts.
 * URL: GET /api/common/votes
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/common/votes")({
  server: {
    handlers: {
      GET: withApiAuth(async ({ request }) => {
        const { fetchAllForVoting } = await import("@/app/api/votes/getVotes");

        const searchParams = new URL(request.url).searchParams;
        const address = searchParams.get("address");
        const blockNumber = searchParams.get("blockNumber");
        const proposalId = searchParams.get("proposalId");

        if (!address || !blockNumber || !proposalId) {
          return new Response("Missing address, blockNumber, or proposalId", {
            status: 400,
          });
        }

        try {
          const allVotes = await fetchAllForVoting(
            address,
            Number(blockNumber),
            proposalId
          );
          return Response.json(allVotes);
        } catch (e: unknown) {
          return new Response("Internal server error: " + String(e), {
            status: 500,
          });
        }
      }),
    },
  },
});
