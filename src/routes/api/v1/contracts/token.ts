/*
 * TanStack Start port of src/app/api/v1/contracts/token/route.ts.
 * URL: GET /api/v1/contracts/token
 */

import { createFileRoute } from "@tanstack/react-router";

import { traceWithUserId } from "@/lib/apiUtils";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/v1/contracts/token")({
  server: {
    handlers: {
      GET: withApiAuth(async ({ request }) => {
        const { authenticateApiUser } = await import(
          "@/app/lib/auth/serverAuth"
        );
        const { default: Tenant } = await import("@/lib/tenant/tenant");
        const { fetchMetrics } = await import(
          "@/app/api/common/metrics/getMetrics"
        );

        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        return await traceWithUserId(
          authResponse.userId as string,
          async () => {
            try {
              const { contracts } = Tenant.current();
              const address = contracts.token.address;
              const chainId = contracts.token.chain.id;
              const { votableSupply, totalSupply } = await fetchMetrics();
              return Response.json({
                address,
                chainId,
                votableSupply,
                totalSupply,
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
