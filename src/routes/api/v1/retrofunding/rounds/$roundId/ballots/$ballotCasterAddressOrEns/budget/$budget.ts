/*
 * TanStack Start port of src/app/api/v1/retrofunding/rounds/[roundId]/ballots/[ballotCasterAddressOrEns]/budget/[budget]/route.ts.
 * URL: POST /api/v1/retrofunding/rounds/:roundId/ballots/:ballotCasterAddressOrEns/budget/:budget
 */

import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

const budgetParser = z.string(z.number().min(2000000).max(8000000));

export const Route = createFileRoute(
  "/api/v1/retrofunding/rounds/$roundId/ballots/$ballotCasterAddressOrEns/budget/$budget"
)({
  server: {
    handlers: {
      POST: withApiAuth(async ({ request, params }) => {
        const { authenticateApiUser, validateAddressScope, getCategoryScope } =
          await import("@/app/lib/auth/serverAuth");
        const { updateBallotBudget } = await import(
          "@/app/api/common/ballots/updateBallot"
        );

        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        const { roundId, ballotCasterAddressOrEns, budget } = params;
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
            const ballot = await updateBallotBudget(
              Number(budgetParser.parse(budget)),
              Number(roundId),
              categoryScope,
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
