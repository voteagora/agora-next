/*
 * TanStack Start port of src/app/api/v1/retrofunding/rounds/[roundId]/ballots/[ballotCasterAddressOrEns]/osMultiplier/[multiplier]/route.ts.
 * URL: POST /api/v1/retrofunding/rounds/:roundId/ballots/:ballotCasterAddressOrEns/osMultiplier/:multiplier
 */

import { createFileRoute } from "@tanstack/react-router";

import { traceWithUserId } from "@/lib/apiUtils";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute(
  "/api/v1/retrofunding/rounds/$roundId/ballots/$ballotCasterAddressOrEns/osMultiplier/$multiplier"
)({
  server: {
    handlers: {
      POST: withApiAuth(async ({ request, params }) => {
        const { authenticateApiUser, validateAddressScope } = await import(
          "@/app/lib/auth/serverAuth"
        );
        const { updateBallotOsMultiplier } = await import(
          "@/app/api/common/ballots/updateBallot"
        );
        const { createOptionalFloatNumberValidator } = await import(
          "@/lib/utils/validators"
        );

        const multiplierValidator = createOptionalFloatNumberValidator(1, 5, 1);

        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        const { roundId, ballotCasterAddressOrEns, multiplier } = params;
        const scopeError = await validateAddressScope(
          ballotCasterAddressOrEns,
          authResponse
        );
        if (scopeError) return scopeError;

        return traceWithUserId(authResponse.userId as string, async () => {
          try {
            const multiplierPayload = multiplierValidator.parse(
              Number(multiplier)
            );
            const ballot = await updateBallotOsMultiplier(
              multiplierPayload,
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
