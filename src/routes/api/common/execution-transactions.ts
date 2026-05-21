/*
 * TanStack Start port of src/app/api/common/execution-transactions/route.ts.
 * URL: GET /api/common/execution-transactions
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/common/execution-transactions")({
  server: {
    handlers: {
      GET: withApiAuth(async ({ request }) => {
        const { default: Tenant } = await import("@/lib/tenant/tenant");
        const { prismaWeb3Client } = await import("@/lib/prisma");

        try {
          const { namespace } = Tenant.current();
          const url = new URL(request.url);
          const proposalId = url.searchParams.get("proposalId");

          if (!proposalId) {
            return Response.json(
              { error: "proposalId parameter is required" },
              { status: 400 }
            );
          }

          const transactions =
            await prismaWeb3Client.proposalExecutionTransaction.findMany({
              where: {
                tenant: namespace,
                proposal_id: proposalId,
              },
              orderBy: {
                executed_at: "desc",
              },
            });

          return Response.json({ transactions });
        } catch (error) {
          console.error("Error fetching execution transactions:", error);
          return Response.json(
            { error: "Internal server error" },
            { status: 500 }
          );
        }
      }),
    },
  },
});
