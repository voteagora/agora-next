/*
 * TanStack Start port of src/app/api/v1/contracts/governor/route.ts.
 * URL: GET /api/v1/contracts/governor
 */

import { createFileRoute } from "@tanstack/react-router";

import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/v1/contracts/governor")({
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
              const { contracts } = Tenant.current();
              return Response.json({
                address: contracts.governor.address,
                abi: contracts.governor.abi,
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
