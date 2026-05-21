/*
 * TanStack Start port of src/app/api/v1/retrofunding/rounds/[roundId]/ballots/[ballotCasterAddressOrEns]/categories/route.ts.
 * URL: POST /api/v1/retrofunding/rounds/:roundId/ballots/:ballotCasterAddressOrEns/categories
 */

import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { traceWithUserId } from "@/lib/apiUtils";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

const ballotPayloadSchema = z.object({
  category_slug: z.string(),
  allocation: z.number(),
  locked: z.boolean(),
});

export const Route = createFileRoute(
  "/api/v1/retrofunding/rounds/$roundId/ballots/$ballotCasterAddressOrEns/categories"
)({
  server: {
    handlers: {
      POST: withApiAuth(async ({ request, params }) => {
        const { authenticateApiUser, validateAddressScope, getCategoryScope } =
          await import("@/lib/auth/serverAuth");
        const { updateBallotCategory } = await import(
          "@/app/api/common/ballots/updateBallotCategories"
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
            const categoryScope = getCategoryScope(authResponse);
            if (!categoryScope) {
              return new Response(
                "This user does not have a category scope. Regenerate the JWT token",
                { status: 401 }
              );
            }
            const result = await updateBallotCategory(
              parsedPayload,
              Number(roundId),
              categoryScope,
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
