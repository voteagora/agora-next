/*
 * TanStack Start port of src/app/api/archive/votes/[proposalId]/route.ts.
 * URL: GET /api/archive/votes/:proposalId
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/archive/votes/$proposalId")({
  server: {
    handlers: {
      GET: withApiAuth(async ({ params }) => {
        const { default: Tenant } = await import("@/lib/tenant/tenant");
        const { fetchRawProposalVotesFromArchive } = await import(
          "@/lib/archiveUtils"
        );

        const { proposalId } = params;
        if (!proposalId) {
          return Response.json(
            { error: "Missing proposal id" },
            { status: 400 }
          );
        }

        const { namespace } = Tenant.current();
        try {
          const rawVotes = await fetchRawProposalVotesFromArchive({
            namespace,
            proposalId,
          });
          return Response.json({ data: rawVotes });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          if (
            errorMessage.includes("404") ||
            errorMessage.includes("Not Found")
          ) {
            return Response.json({ data: [] });
          }
          console.error("Error fetching archive votes:", error);
          return Response.json({ data: [] });
        }
      }),
    },
  },
});
