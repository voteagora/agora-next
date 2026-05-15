/*
 * TanStack Start port of src/app/api/internal/safe/tracked-transactions/cleanup/route.ts.
 * URL: POST /api/internal/safe/tracked-transactions/cleanup
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute(
  "/api/internal/safe/tracked-transactions/cleanup"
)({
  server: {
    handlers: {
      POST: withApiAuth(
        async ({ request }) => {
          const { deleteExpiredSafeTrackedTransactions } = await import(
            "@/lib/safeTrackedTransactions.server"
          );

          try {
            const authHeader = request.headers.get("authorization");
            const cronSecret = process.env.CRON_SECRET;

            if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
              return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
              );
            }

            const { cutoff, deletedCount } =
              await deleteExpiredSafeTrackedTransactions();

            return Response.json({
              deletedCount,
              cutoff: cutoff.toISOString(),
            });
          } catch (error) {
            return Response.json(
              {
                message:
                  error instanceof Error
                    ? error.message
                    : "Failed to clean up expired Safe tracked transactions",
              },
              { status: 500 }
            );
          }
        },
        { skipAuth: true }
      ),
    },
  },
});
