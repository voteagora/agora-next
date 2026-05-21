/*
 * TanStack Start port of src/app/api/v1/retrofunding/rounds/[roundId]/impactMetrics/[impactMetricId]/comments/route.ts.
 * URL: GET /api/v1/retrofunding/rounds/:roundId/impactMetrics/:impactMetricId/comments
 *      PUT /api/v1/retrofunding/rounds/:roundId/impactMetrics/:impactMetricId/comments
 */

import { createFileRoute } from "@tanstack/react-router";

import { traceWithUserId } from "@/lib/apiUtils";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute(
  "/api/v1/retrofunding/rounds/$roundId/impactMetrics/$impactMetricId/comments"
)({
  server: {
    handlers: {
      GET: withApiAuth(async ({ request, params }) => {
        const { authenticateApiUser } = await import(
          "@/app/lib/auth/serverAuth"
        );
        const { fetchImpactMetricComments } = await import(
          "@/app/api/common/comments/getImpactMetricComments"
        );
        const { createOptionalNumberValidator, createOptionalStringValidator } =
          await import("@/lib/utils/validators");

        const DEFAULT_SORT = "newest";
        const DEFAULT_MAX_LIMIT = 100;
        const DEFAULT_LIMIT = 20;
        const DEFAULT_OFFSET = 0;

        const sortValidator = createOptionalStringValidator(
          ["newest", "votes"],
          DEFAULT_SORT
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
          const { roundId, impactMetricId } = params;
          const searchParams = new URL(request.url).searchParams;
          try {
            const sort = sortValidator.parse(searchParams.get("sort"));
            const limit = limitValidator.parse(searchParams.get("limit"));
            const offset = offsetValidator.parse(searchParams.get("offset"));
            const comments = await fetchImpactMetricComments({
              roundId,
              impactMetricId,
              sort,
              limit,
              offset,
            });
            return Response.json(comments);
          } catch (e: unknown) {
            return new Response("Internal server error: " + String(e), {
              status: 500,
            });
          }
        });
      }),

      PUT: withApiAuth(async ({ request, params }) => {
        const { authenticateApiUser } = await import(
          "@/app/lib/auth/serverAuth"
        );
        const { createImpactMetricComment } = await import(
          "@/app/api/common/comments/createImpactMetricComment"
        );

        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }
        if (!authResponse.userId) {
          return new Response("Can't get user address from auth token", {
            status: 401,
          });
        }
        if (!authResponse.scope?.includes("badgeholder")) {
          return new Response("Only badgeholder can vote on a comment", {
            status: 401,
          });
        }

        return traceWithUserId(authResponse.userId, async () => {
          const { impactMetricId } = params;
          const body = await request.json();
          if (!body.comment) {
            return new Response("Missing comment in request body", {
              status: 400,
            });
          }
          try {
            const comment = await createImpactMetricComment({
              metricId: impactMetricId,
              address: authResponse.userId!,
              comment: body.comment,
            });
            return Response.json(comment);
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
