/*
 * TanStack Start port of src/app/api/v1/delegates/[addressOrENSName]/delegatees/route.ts.
 * URL: GET /api/v1/delegates/:addressOrENSName/delegatees
 */

import { createFileRoute } from "@tanstack/react-router";

import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute(
  "/api/v1/delegates/$addressOrENSName/delegatees"
)({
  server: {
    handlers: {
      GET: withApiAuth(async ({ request, params }) => {
        const { authenticateApiUser } = await import(
          "@/app/lib/auth/serverAuth"
        );
        const { fetchCurrentDelegatees } = await import(
          "@/app/api/common/delegations/getDelegations"
        );

        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        return await traceWithUserId(
          authResponse.userId as string,
          async () => {
            try {
              const { addressOrENSName } = params as {
                addressOrENSName: string;
              };
              const delegate = await fetchCurrentDelegatees(addressOrENSName);
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
