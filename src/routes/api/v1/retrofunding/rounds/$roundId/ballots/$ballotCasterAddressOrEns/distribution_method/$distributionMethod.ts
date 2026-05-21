/*
 * TanStack Start port of src/app/api/v1/retrofunding/rounds/[roundId]/ballots/[ballotCasterAddressOrEns]/distribution_method/[distributionMethod]/route.ts.
 * URL: POST /api/v1/retrofunding/rounds/:roundId/ballots/:ballotCasterAddressOrEns/distribution_method/:distributionMethod
 */

import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { traceWithUserId } from "@/lib/apiUtils";
import { withApiAuth } from "@/lib/start-server/withApiAuth";
import type { DistributionStrategy as DistStrat } from "@/lib/types/ballotDistribution";

export const Route = createFileRoute(
  "/api/v1/retrofunding/rounds/$roundId/ballots/$ballotCasterAddressOrEns/distribution_method/$distributionMethod"
)({
  server: {
    handlers: {
      POST: withApiAuth(async ({ request, params }) => {
        const { authenticateApiUser, getCategoryScope } = await import(
          "@/app/lib/auth/serverAuth"
        );
        const { applyDistributionStrategy, DistributionStrategy } =
          await import("@/app/api/common/ballots/ballotDistributionStrategy");

        const distributionMethodValidator = z.enum(
          Object.values(DistributionStrategy) as [string, ...string[]]
        );

        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        const { roundId, ballotCasterAddressOrEns, distributionMethod } =
          params;

        return traceWithUserId(authResponse.userId as string, async () => {
          try {
            const categoryScope = getCategoryScope(authResponse);
            if (!categoryScope) {
              return new Response(
                "This user does not have a category scope. Regenerate the JWT token",
                { status: 401 }
              );
            }
            const ballot = await applyDistributionStrategy(
              distributionMethodValidator.parse(
                distributionMethod
              ) as DistStrat,
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
