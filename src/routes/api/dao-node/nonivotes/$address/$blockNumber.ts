/*
 * TanStack Start port of src/app/api/dao-node/nonivotes/[address]/[blockNumber]/route.ts.
 * URL: GET /api/dao-node/nonivotes/:address/:blockNumber
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute(
  "/api/dao-node/nonivotes/$address/$blockNumber"
)({
  server: {
    handlers: {
      GET: withApiAuth(async ({ params }) => {
        const { getUserNonIVotesVPAtBlock } = await import(
          "@/app/lib/dao-node/client"
        );

        const { address, blockNumber } = params;

        if (!address || !blockNumber) {
          return Response.json(
            { error: "Missing address or blockNumber" },
            { status: 400 }
          );
        }

        const blockNum = parseInt(blockNumber, 10);
        if (isNaN(blockNum)) {
          return Response.json(
            { error: "Invalid block number" },
            { status: 400 }
          );
        }

        try {
          const vp = await getUserNonIVotesVPAtBlock(address, blockNum);
          return Response.json({ vp: vp || "0" });
        } catch (error) {
          console.error("Error fetching voting power:", error);
          return Response.json(
            { error: "Failed to fetch voting power" },
            { status: 500 }
          );
        }
      }),
    },
  },
});
