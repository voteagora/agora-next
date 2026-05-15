/*
 * TanStack Start port of src/app/api/v1/retrofunding/rounds/[roundId]/ballots/[ballotCasterAddressOrEns]/projects/[projectId]/impact/[impact]/route.ts.
 * URL: POST /api/v1/retrofunding/rounds/:roundId/ballots/:ballotCasterAddressOrEns/projects/:projectId/impact/:impact
 */

import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

const impactParser = z.number().int().gte(0).lte(5);

export const Route = createFileRoute(
  "/api/v1/retrofunding/rounds/$roundId/ballots/$ballotCasterAddressOrEns/projects/$projectId/impact/$impact"
)({
  server: {
    handlers: {
      POST: withApiAuth(async ({ request, params }) => {
        const {
          authenticateApiUser,
          validateAddressScope,
          validateProjectCategoryScope,
          getCategoryScope,
        } = await import("@/app/lib/auth/serverAuth");
        const { updateBallotProjectImpact } = await import(
          "@/app/api/common/ballots/updateBallotProject"
        );

        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        const { roundId, ballotCasterAddressOrEns, projectId, impact } = params;
        const scopeError = await validateAddressScope(
          ballotCasterAddressOrEns,
          authResponse
        );
        if (scopeError) return scopeError;

        return traceWithUserId(authResponse.userId as string, async () => {
          try {
            const projectScopeError = await validateProjectCategoryScope(
              projectId,
              roundId,
              authResponse
            );
            if (projectScopeError) return projectScopeError;

            const categoryScope = getCategoryScope(authResponse);
            const ballot = await updateBallotProjectImpact(
              impactParser.parse(Number(impact)),
              projectId,
              Number(roundId),
              categoryScope!,
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
