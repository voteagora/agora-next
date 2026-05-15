/*
 * TanStack Start port of src/app/api/v1/delegates/[addressOrENSName]/route.ts.
 * Filename uses TanStack's `$param` convention (no brackets).
 *
 * URL: GET /api/v1/delegates/:addressOrENSName
 */

import { createFileRoute } from "@tanstack/react-router";

import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/v1/delegates/$addressOrENSName")({
  server: {
    handlers: {
      GET: withApiAuth(async ({ request, params }) => {
        const { authenticateApiUser } = await import(
          "@/app/lib/auth/serverAuth"
        );
        const { fetchDelegate } = await import(
          "@/app/api/common/delegates/getDelegates"
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
              const delegate = await fetchDelegate(addressOrENSName);
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
