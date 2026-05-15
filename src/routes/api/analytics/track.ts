/*
 * TanStack Start port of src/app/api/analytics/track/route.ts.
 * URL: POST /api/analytics/track
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/analytics/track")({
  server: {
    handlers: {
      POST: withApiAuth(async ({ request }) => {
        const { default: Tenant } = await import("@/lib/tenant/tenant");
        const { prismaWeb2Client } = await import("@/app/lib/prisma");
        const { authenticateApiUser } = await import(
          "@/app/lib/auth/serverAuth"
        );

        const { slug } = Tenant.current();
        const authResponse = await authenticateApiUser(request);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        const { event_name, event_data } = await request.json();
        try {
          await prismaWeb2Client.analyticsEvent.create({
            data: {
              event_name,
              event_data,
              dao_slug: slug,
            },
          });
          return Response.json({ success: true });
        } catch (e: unknown) {
          return new Response("Internal server error: " + String(e), {
            status: 500,
          });
        }
      }),
    },
  },
});
