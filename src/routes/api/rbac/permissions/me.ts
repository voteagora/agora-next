/*
 * TanStack Start port of src/app/api/rbac/permissions/me/route.ts.
 * URL: GET /api/rbac/permissions/me
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/rbac/permissions/me")({
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
            const daoSlug = searchParams.get("daoSlug");
            const requestedAddress = searchParams.get("address")?.toLowerCase();

            if (!daoSlug) {
              return Response.json(
                { error: "daoSlug is required" },
                { status: 400 }
              );
            }

            if (requestedAddress && requestedAddress !== auth.address) {
              return Response.json({ error: "Forbidden" }, { status: 403 });
            }

            const permissions = await permissionService.getUserPermissions(
              auth.address,
              daoSlug as never
            );

            return Response.json({
              address: auth.address,
              daoSlug,
              permissions,
            });
          } catch (error) {
            console.error("Failed to fetch user permissions:", error);
            return Response.json(
              { error: "Failed to fetch permissions" },
              { status: 500 }
            );
          }
        },
        { skipAuth: true }
      ),
    },
  },
});
