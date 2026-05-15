/*
 * TanStack Start port of src/app/api/v1/notification-preferences/preferences/set/route.ts.
 * URL: POST /api/v1/notification-preferences/preferences/set
 */

import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";
import type { DaoSlug } from "@prisma/client";

import { requireNotificationPreferencesAuth } from "@/app/api/v1/notification-preferences/auth";
import { ensureNotificationRecipient } from "@/app/api/v1/notification-preferences/recipient";
import { notificationCenterClient } from "@/lib/notification-center/client";
import { resolveEventTypes } from "@/lib/notification-center/eventTypes.server";
import { PermissionService } from "@/server/services/permission.service";
import Tenant from "@/lib/tenant/tenant";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

const BodySchema = z.object({
  eventType: z.string().min(1),
  channel: z.enum(["email", "discord", "telegram", "slack", "pwa"]),
  state: z.enum(["on", "off"]),
});

export const Route = createFileRoute(
  "/api/v1/notification-preferences/preferences/set"
)({
  server: {
    handlers: {
      POST: withApiAuth(
        async ({ request }) => {
          const auth = await requireNotificationPreferencesAuth(
            request as never
          );
          if (!auth.ok) return auth.response;

          let body: unknown;
          try {
            body = await request.json();
          } catch {
            return Response.json({ message: "Invalid JSON" }, { status: 400 });
          }

          const parsed = BodySchema.safeParse(body);
          if (!parsed.success) {
            return Response.json(
              { message: "Invalid request payload" },
              { status: 400 }
            );
          }

          const eventTypes = await resolveEventTypes();
          const eventTypeConfig = eventTypes.find(
            (et) => et.event_type === parsed.data.eventType
          );
          if (eventTypeConfig?.category === "grants") {
            const { slug } = Tenant.current();
            const permissionService = new PermissionService();
            const hasGrantsPermission = await permissionService.checkPermission(
              { address: auth.recipientId, daoSlug: slug as DaoSlug },
              { module: "grants", resource: "applications", action: "read" }
            );
            if (!hasGrantsPermission) {
              return Response.json(
                {
                  message:
                    "You do not have permission to manage grants notifications",
                },
                { status: 403 }
              );
            }
          }

          try {
            await ensureNotificationRecipient(auth.recipientId);
            const response = await notificationCenterClient.setPreference(
              auth.recipientId,
              parsed.data.eventType,
              parsed.data.channel,
              parsed.data.state
            );
            return Response.json(response);
          } catch (error) {
            console.error("Failed to update notification preference", error);
            return Response.json(
              { message: "Failed to update notification preference" },
              { status: 500 }
            );
          }
        },
        { skipAuth: true }
      ),
    },
  },
});
