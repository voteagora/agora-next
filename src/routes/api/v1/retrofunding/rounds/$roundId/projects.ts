/*
 * TanStack Start port of src/app/api/v1/retrofunding/rounds/[roundId]/projects/route.ts.
 * URL: GET /api/v1/retrofunding/rounds/:roundId/projects
 */

import { createFileRoute } from "@tanstack/react-router";

import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute(
  "/api/v1/retrofunding/rounds/$roundId/projects"
)({
  server: {
    handlers: {
      GET: withApiAuth(async ({ request, params }) => {
        const { authenticateApiUser } = await import(
          "@/app/lib/auth/serverAuth"
        );
        const { fetchProjectsApi } = await import(
          "@/app/api/common/projects/getProjects"
        );
        const { createOptionalNumberValidator, createOptionalStringValidator } =
          await import("@/app/api/common/utils/validators");

        const DEFAULT_MAX_LIMIT = 100;
        const DEFAULT_LIMIT = 20;
        const DEFAULT_OFFSET = 0;
        const DEFAULT_FILTER = "all";

        const filterValidator = createOptionalStringValidator(
          [
            "all",
            "eth_core",
            "op_tooling",
            "op_rnd",
            "gov_infra",
            "gov_analytics",
            "gov_leadership",
          ],
          DEFAULT_FILTER
        );
        const limitValidator = createOptionalNumberValidator(
          1,
          DEFAULT_MAX_LIMIT,
          DEFAULT_LIMIT
        );
        const offsetValidator = createOptionalNumberValidator(
          0,
          Number.MAX_SAFE_INTEGER,
          DEFAULT_OFFSET
        );

        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        return traceWithUserId(authResponse.userId as string, async () => {
          const searchParams = new URL(request.url).searchParams;
          try {
            const category = filterValidator.parse(
              searchParams.get("category")
            );
            const limit = limitValidator.parse(searchParams.get("limit"));
            const offset = offsetValidator.parse(searchParams.get("offset"));
            const projects = await fetchProjectsApi({
              pagination: { limit, offset },
              round: params.roundId,
              category,
            });
            return Response.json(projects);
          } catch (e: unknown) {
            return new Response("Internal server error: " + String(e), {
              status: 500,
            });
          }
        });
      }),
    },
  },
});
