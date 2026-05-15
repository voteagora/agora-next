/*
 * TanStack Start port of src/app/api/v1/retrofunding/rounds/[roundId]/ballots/[ballotCasterAddressOrEns]/osOnly/[toggle]/route.ts.
 * URL: POST /api/v1/retrofunding/rounds/:roundId/ballots/:ballotCasterAddressOrEns/osOnly/:toggle
 */

import { createFileRoute } from "@tanstack/react-router";

import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute(
  "/api/v1/retrofunding/rounds/$roundId/ballots/$ballotCasterAddressOrEns/osOnly/$toggle"
)({
  server: {
    handlers: {
      POST: withApiAuth(async ({ request, params }) => {
        const { authenticateApiUser, validateAddressScope } = await import(
          "@/app/lib/auth/serverAuth"
        );
        const { updateBallotOsOnly } = await import(
          "@/app/api/common/ballots/updateBallot"
        );

        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        const { roundId, ballotCasterAddressOrEns, toggle } = params;
        const scopeError = await validateAddressScope(
          ballotCasterAddressOrEns,
          authResponse
        );
        if (scopeError) return scopeError;

        return traceWithUserId(authResponse.userId as string, async () => {
          try {
            const ballot = await updateBallotOsOnly(
              toggle === "true",
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
