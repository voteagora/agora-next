/*
 * TanStack Start port of src/app/api/v1/retrofunding/rounds/[roundId]/ballots/[ballotCasterAddressOrEns]/projects/[projectId]/position/[position]/route.ts.
 * URL: POST /api/v1/retrofunding/rounds/:roundId/ballots/:ballotCasterAddressOrEns/projects/:projectId/position/:position
 */

import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

const positionParser = z.number().int().gte(0);

export const Route = createFileRoute(
  "/api/v1/retrofunding/rounds/$roundId/ballots/$ballotCasterAddressOrEns/projects/$projectId/position/$position"
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
        const { updateBallotProjectPosition } = await import(
          "@/app/api/common/ballots/updateBallotProject"
        );

        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        const { roundId, ballotCasterAddressOrEns, projectId, position } =
          params;
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
            const ballot = await updateBallotProjectPosition(
              positionParser.parse(Number(position)),
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
