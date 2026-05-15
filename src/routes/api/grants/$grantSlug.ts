/*
 * TanStack Start port of src/app/api/grants/[grantSlug]/route.ts.
 * URL: GET /api/grants/:grantSlug
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/grants/$grantSlug")({
  server: {
    handlers: {
      GET: withApiAuth(async ({ params }) => {
        const { getGrant } = await import("@/app/api/common/grants/getGrant");

        try {
          const grant = await getGrant(params.grantSlug);

          if (!grant) {
            return Response.json({ error: "Grant not found" }, { status: 404 });
          }

          const transformedGrant = {
            id: grant.id,
            title: grant.title,
            description: grant.description,
            slug: grant.slug,
            active: grant.active,
            budgetRange: grant.budget_range || "TBD",
            deadline: grant.deadline
              ? new Date(grant.deadline).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "No deadline",
            form_schema: grant.form_schema || [],
            bottom_text_config: grant.bottom_text_config || null,
            bottom_text: grant.bottom_text || null,
            category: grant.category || null,
          };

          return Response.json(transformedGrant, { status: 200 });
        } catch (error) {
          console.error("Error fetching grant:", error);
          return Response.json(
            { error: "Failed to fetch grant" },
            { status: 500 }
          );
        }
      }),
    },
  },
});
