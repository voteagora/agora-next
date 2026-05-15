/*
 * TanStack Start port of src/app/api/v1/grants/applications/route.ts.
 * Uses requireWalletJwtAuth + permissionService, not bearer-token middleware.
 *
 * URL: GET /api/v1/grants/applications
 */

import { createFileRoute } from "@tanstack/react-router";
import { Prisma } from "@prisma/client";
import type { DaoSlug } from "@prisma/client";

import { prismaWeb2Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { permissionService } from "@/server/services/permission.service";
import { requireWalletJwtAuth } from "@/app/lib/auth/walletJwt";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/v1/grants/applications")({
  server: {
    handlers: {
      GET: withApiAuth(
        async ({ request }) => {
          try {
            const auth = await requireWalletJwtAuth(request as never);
            if (!auth.ok) return auth.response;

            const { slug } = Tenant.current();
            const daoSlug = slug as DaoSlug;
            const hasReadPermission = await permissionService.checkPermission(
              { address: auth.address, daoSlug },
              { module: "grants", resource: "applications", action: "read" }
            );

            if (!hasReadPermission) {
              return Response.json({ error: "Forbidden" }, { status: 403 });
            }

            const { searchParams } = new URL(request.url);
            const status = searchParams.get("status");
            const limit = parseInt(searchParams.get("limit") || "50");
            const offset = parseInt(searchParams.get("offset") || "0");

            const whereSql = Prisma.sql`
              WHERE g.dao_slug::text = ${slug}
              ${status ? Prisma.sql` AND ga.status = ${status}` : Prisma.empty}
            `;

            const applications = await prismaWeb2Client.$queryRaw(
              Prisma.sql`
                SELECT
                  ga.id, ga.grant_id, ga.applicant_address, ga.email,
                  ga.telegram_handle, ga.organization, ga.data, ga.status,
                  ga.created_at, g.slug as grant_slug, g.title as grant_title
                FROM alltenant.grant_applications ga
                JOIN alltenant.grants g ON ga.grant_id = g.id
                ${whereSql}
                ORDER BY ga.created_at DESC
                LIMIT ${limit} OFFSET ${offset}
              `
            );

            const countResult = await prismaWeb2Client.$queryRaw<
              Array<{ total: bigint }>
            >(
              Prisma.sql`
                SELECT COUNT(*) as total
                FROM alltenant.grant_applications ga
                JOIN alltenant.grants g ON ga.grant_id = g.id
                ${whereSql}
              `
            );
            const total = Number(countResult[0].total);

            return Response.json({
              applications,
              pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total,
              },
            });
          } catch (error) {
            console.error("Error fetching grant applications:", error);
            return Response.json(
              { error: "Failed to fetch applications" },
              { status: 500 }
            );
          }
        },
        { skipAuth: true }
      ),
    },
  },
});
