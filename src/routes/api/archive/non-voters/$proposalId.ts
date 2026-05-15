/*
 * TanStack Start port of src/app/api/archive/non-voters/[proposalId]/route.ts.
 * URL: GET /api/archive/non-voters/:proposalId
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/archive/non-voters/$proposalId")({
  server: {
    handlers: {
      GET: withApiAuth(async ({ params }) => {
        const { default: Tenant } = await import("@/lib/tenant/tenant");
        const { fetchRawProposalNonVotersFromArchive } = await import(
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
          const rawNonVoters = await fetchRawProposalNonVotersFromArchive({
            namespace,
            proposalId,
          });
          return Response.json({ data: rawNonVoters });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          if (
            errorMessage.includes("404") ||
            errorMessage.includes("Not Found")
          ) {
            return Response.json({ data: [] });
          }
          console.error("Error fetching archive non-voters:", error);
          return Response.json({ data: [] });
        }
      }),
    },
  },
});
