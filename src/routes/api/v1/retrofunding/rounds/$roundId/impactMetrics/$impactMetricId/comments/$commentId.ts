/*
 * TanStack Start port of src/app/api/v1/retrofunding/rounds/[roundId]/impactMetrics/[impactMetricId]/comments/[commentId]/route.ts.
 * URL: GET|PUT|DELETE /api/v1/retrofunding/rounds/:roundId/impactMetrics/:impactMetricId/comments/:commentId
 */

import { createFileRoute } from "@tanstack/react-router";

import { traceWithUserId } from "@/lib/apiUtils";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute(
  "/api/v1/retrofunding/rounds/$roundId/impactMetrics/$impactMetricId/comments/$commentId"
)({
  server: {
    handlers: {
      GET: withApiAuth(async ({ request, params }) => {
        const { authenticateApiUser } = await import(
          "@/app/lib/auth/serverAuth"
        );
        const { fetchImpactMetricComment } = await import(
          "@/app/api/common/comments/getImpactMetricComments"
        );

        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        return traceWithUserId(authResponse.userId as string, async () => {
          try {
            const comment = await fetchImpactMetricComment(
              Number(params.commentId)
            );
            return Response.json(comment);
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
        const { updateImpactMetricComment } = await import(
          "@/app/api/common/comments/updateImpactMetricComment"
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

        return traceWithUserId(authResponse.userId, async () => {
          const { commentId, impactMetricId } = params;
          const body = await request.json();
          if (!body.comment) {
            return new Response("Missing comment in request body", {
              status: 400,
            });
          }
          try {
            const comment = await updateImpactMetricComment({
              commentId: Number(commentId),
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

      DELETE: withApiAuth(async ({ request, params }) => {
        const { authenticateApiUser } = await import(
          "@/app/lib/auth/serverAuth"
        );
        const { deleteImpactMetricComment } = await import(
          "@/app/api/common/comments/deleteImpactMetricComment"
        );

        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        return traceWithUserId(authResponse.userId as string, async () => {
          try {
            const result = await deleteImpactMetricComment({
              commentId: Number(params.commentId),
            });
            return Response.json(result);
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
