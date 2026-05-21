/*
 * TanStack Start port of src/app/api/v1/contracts/alligator/route.ts.
 * URL: GET /api/v1/contracts/alligator
 */

import { createFileRoute } from "@tanstack/react-router";

import { traceWithUserId } from "@/lib/apiUtils";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/v1/contracts/alligator")({
  server: {
    handlers: {
      GET: withApiAuth(async ({ request }) => {
        const { authenticateApiUser } = await import(
          "@/app/lib/auth/serverAuth"
        );
        const { default: Tenant } = await import("@/lib/tenant/tenant");

        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        return await traceWithUserId(
          authResponse.userId as string,
          async () => {
            try {
              const { contracts, namespace } = Tenant.current();
              if (!contracts.alligator) {
                return new Response(
                  `Alligator does not exist for ${namespace}`,
                  { status: 404 }
                );
              }
              return Response.json({
                address: contracts.alligator.address,
                chainId: contracts.alligator.chain.id,
              });
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
