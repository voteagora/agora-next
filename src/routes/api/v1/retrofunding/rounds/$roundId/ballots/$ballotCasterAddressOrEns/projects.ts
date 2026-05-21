/*
 * TanStack Start port of src/app/api/v1/retrofunding/rounds/[roundId]/ballots/[ballotCasterAddressOrEns]/projects/route.ts.
 * URL: POST /api/v1/retrofunding/rounds/:roundId/ballots/:ballotCasterAddressOrEns/projects
 */

import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { traceWithUserId } from "@/lib/apiUtils";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

const ballotPayloadSchema = z.object({
  projects: z.array(
    z.object({
      project_id: z.string(),
      allocation: z.string(z.number().min(0).max(100)).nullable(),
      impact: z.number(),
    })
  ),
});

export const Route = createFileRoute(
  "/api/v1/retrofunding/rounds/$roundId/ballots/$ballotCasterAddressOrEns/projects"
)({
  server: {
    handlers: {
      POST: withApiAuth(async ({ request, params }) => {
        const { authenticateApiUser, validateAddressScope, getCategoryScope } =
          await import("@/lib/auth/serverAuth");
        const { updateAllProjectsInBallot } = await import(
          "@/app/api/common/ballots/updateBallotProject"
        );

        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        const { roundId, ballotCasterAddressOrEns } = params;
        const scopeError = await validateAddressScope(
          ballotCasterAddressOrEns,
          authResponse
        );
        if (scopeError) return scopeError;

        return traceWithUserId(authResponse.userId as string, async () => {
          try {
            const categoryScope = getCategoryScope(authResponse);
            if (!categoryScope) {
              return new Response(
                "This user does not have a category scope. Regenerate the JWT token",
                { status: 401 }
              );
            }
            const payload = await request.json();
            const parsedPayload = ballotPayloadSchema.parse(payload);
            const ballot = await updateAllProjectsInBallot(
              parsedPayload.projects,
              categoryScope,
              Number(roundId),
              ballotCasterAddressOrEns
            );
            return Response.json(ballot);
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
