/*
 * TanStack Start port of src/app/api/v1/delegates/[addressOrENSName]/delegators/route.ts.
 * URL: GET /api/v1/delegates/:addressOrENSName/delegators
 */

import { createFileRoute } from "@tanstack/react-router";

import { traceWithUserId } from "@/lib/apiUtils";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute(
  "/api/v1/delegates/$addressOrENSName/delegators"
)({
  server: {
    handlers: {
      GET: withApiAuth(async ({ request, params }) => {
        const { authenticateApiUser } = await import(
          "@/app/lib/auth/serverAuth"
        );
        const { fetchCurrentDelegators } = await import(
          "@/app/api/common/delegations/getDelegations"
        );
        const { createOptionalNumberValidator } = await import(
          "@/lib/utils/validators"
        );

        const DEFAULT_MAX_LIMIT = 100;
        const DEFAULT_LIMIT = 20;
        const DEFAULT_OFFSET = 0;
        const limitValidator = createOptionalNumberValidator(
          1,
          DEFAULT_MAX_LIMIT,
          DEFAULT_LIMIT
        );
        const offsetValidator = createOptionalNumberValidator(
          0,
          Number.MAX_SAFE_INTEGER,
          DEFAULT_OFFSET
        );

        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        return await traceWithUserId(
          authResponse.userId as string,
          async () => {
            const searchParams = new URL(request.url).searchParams;
            try {
              const { addressOrENSName } = params as {
                addressOrENSName: string;
              };
              const limit = limitValidator.parse(searchParams.get("limit"));
              const offset = offsetValidator.parse(searchParams.get("offset"));
              const delegate = await fetchCurrentDelegators(addressOrENSName, {
                limit,
                offset,
              });
              return Response.json(delegate);
            } catch (e: any) {
              return new Response("Internal server error: " + e.toString(), {
                status: 500,
              });
            }
          }
        );
      }),
    },
  },
});
