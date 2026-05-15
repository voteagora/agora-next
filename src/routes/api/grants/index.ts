/*
 * TanStack Start port of src/app/api/grants/route.ts.
 * URL: GET /api/grants
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/grants/")({
  server: {
    handlers: {
      GET: withApiAuth(async () => {
        const { getGrants } = await import("@/app/api/common/grants/getGrants");

        try {
          const grants = await getGrants();

          const transformedGrants = grants.map((grant) => ({
            id: grant.id,
            title: grant.title,
            description: grant.description,
            slug: grant.slug,
            active: grant.active,
            budgetRange: grant.budget_range || null,
            deadline: grant.deadline
              ? new Date(grant.deadline).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : null,
          }));

          return Response.json(transformedGrants, { status: 200 });
        } catch (error) {
          console.error("Error fetching grants:", error);
          return Response.json(
            { error: "Failed to fetch grants" },
            { status: 500 }
          );
        }
      }),
    },
  },
});
