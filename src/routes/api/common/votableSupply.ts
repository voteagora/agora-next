/*
 * TanStack Start port of src/app/api/common/votableSupply/route.ts.
 * URL: GET /api/common/votableSupply
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/common/votableSupply")({
  server: {
    handlers: {
      GET: withApiAuth(async () => {
        const { findVotableSupply } = await import("@/lib/prismaUtils");
        const { default: Tenant } = await import("@/lib/tenant/tenant");

        const { namespace, contracts } = Tenant.current();
        const address = contracts.token.address;

        try {
          const response = await findVotableSupply({ namespace, address });
          return Response.json(response);
        } catch (e: unknown) {
          return new Response("Internal server error: " + String(e), {
            status: 500,
          });
        }
      }),
    },
  },
});
