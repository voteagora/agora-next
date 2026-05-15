/*
 * TanStack Start port of src/app/api/v1/retrofunding/rounds/[roundId]/ballots/[ballotCasterAddressOrEns]/impactMetrics/route.ts.
 * URL: POST /api/v1/retrofunding/rounds/:roundId/ballots/:ballotCasterAddressOrEns/impactMetrics
 */

import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

const ballotPayloadSchema = z.object({
  metric_id: z.string(),
  allocation: z.number(),
  locked: z.boolean(),
});

export const Route = createFileRoute(
  "/api/v1/retrofunding/rounds/$roundId/ballots/$ballotCasterAddressOrEns/impactMetrics"
)({
  server: {
    handlers: {
      POST: withApiAuth(async ({ request, params }) => {
        const { authenticateApiUser, validateAddressScope } = await import(
          "@/app/lib/auth/serverAuth"
        );
        const { updateBallotMetric } = await import(
          "@/app/api/common/ballots/updateBallot"
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
            const payload = await request.json();
            const parsedPayload = ballotPayloadSchema.parse(payload);
            const result = await updateBallotMetric(
              parsedPayload,
              Number(roundId),
              ballotCasterAddressOrEns
            );
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
