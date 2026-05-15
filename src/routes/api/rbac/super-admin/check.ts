/*
 * TanStack Start port of src/app/api/rbac/super-admin/check/route.ts.
 * URL: GET /api/rbac/super-admin/check
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/rbac/super-admin/check")({
  server: {
    handlers: {
      GET: withApiAuth(
        async ({ request }) => {
          const { permissionService } = await import(
            "@/server/services/permission.service"
          );
          const { requireWalletJwtAuth } = await import(
            "@/app/lib/auth/walletJwt"
          );

          try {
            const auth = await requireWalletJwtAuth(request as never);
            if (!auth.ok) return auth.response;

            const { searchParams } = new URL(request.url);
            const requestedAddress = searchParams.get("address")?.toLowerCase();

            if (requestedAddress && requestedAddress !== auth.address) {
              return Response.json({ error: "Forbidden" }, { status: 403 });
            }

            const isSuperAdmin = await permissionService.isSuperAdmin(
              auth.address
            );

            return Response.json({ address: auth.address, isSuperAdmin });
          } catch (error) {
            console.error("Failed to check super admin status:", error);
            return Response.json(
              { error: "Failed to check super admin status" },
              { status: 500 }
            );
          }
        },
        { skipAuth: true }
      ),
    },
  },
});
