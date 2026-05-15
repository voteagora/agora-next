/*
 * TanStack Start port of src/app/api/v1/retrofunding/rounds/[roundId]/impactMetrics/[impactMetricId]/comments/[commentId]/votes/route.ts.
 * URL: GET|PUT /api/v1/retrofunding/rounds/:roundId/impactMetrics/:impactMetricId/comments/:commentId/votes
 */

import { createFileRoute } from "@tanstack/react-router";

import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute(
  "/api/v1/retrofunding/rounds/$roundId/impactMetrics/$impactMetricId/comments/$commentId/votes"
)({
  server: {
    handlers: {
      GET: withApiAuth(async ({ request, params }) => {
        const { authenticateApiUser } = await import(
          "@/app/lib/auth/serverAuth"
        );
        const { fetchImpactMetricCommentVotes } = await import(
          "@/app/api/common/comments/getImpactMetricCommentVotes"
        );

        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        return traceWithUserId(authResponse.userId as string, async () => {
          try {
            const votes = await fetchImpactMetricCommentVotes({
              commentId: Number(params.commentId),
            });
            return Response.json(votes);
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
        const { updateImpactMetricCommentVote } = await import(
          "@/app/api/common/comments/updateImpactMetricCommentVote"
        );
        const { createOptionalNumberValidator } = await import(
          "@/app/api/common/utils/validators"
        );

        const voteValidator = createOptionalNumberValidator(-1, 1, 0);

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
          const body = await request.json();
          if (body.vote == undefined) {
            return new Response("Missing vote in request body", {
              status: 400,
            });
          }
          try {
            const vote = voteValidator.parse(body.vote);
            const result = await updateImpactMetricCommentVote({
              commentId: Number(params.commentId),
              vote,
              address: authResponse.userId as string,
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
