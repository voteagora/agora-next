/*
 * TanStack Start port of src/app/api/v1/notification-preferences/route.ts.
 *
 * Uses its own auth (requireNotificationPreferencesAuth), not the standard
 * bearer-token middleware — so `withApiAuth` is configured with skipAuth and
 * we run the route-specific guard inside the handler.
 *
 * URL: GET /api/v1/notification-preferences
 */

import { createFileRoute } from "@tanstack/react-router";

import { requireNotificationPreferencesAuth } from "@/app/api/v1/notification-preferences/auth";
import { notificationCenterClient } from "@/lib/notification-center/client";
import { resolveEventTypes } from "@/lib/notification-center/eventTypes.server";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/v1/notification-preferences")({
  server: {
    handlers: {
      GET: withApiAuth(
        async ({ request }) => {
          const auth = await requireNotificationPreferencesAuth(
            request as never
          );
          if (!auth.ok) return auth.response;

          try {
            const [recipient, preferences, eventTypes] = await Promise.all([
              notificationCenterClient.getRecipient(auth.recipientId),
              notificationCenterClient.getPreferences(auth.recipientId),
              resolveEventTypes(),
            ]);
            return Response.json({ recipient, preferences, eventTypes });
          } catch (error) {
            console.error("Failed to load notification settings", error);
            return Response.json(
              { message: "Failed to load notification settings" },
              { status: 500 }
            );
          }
        },
        { skipAuth: true }
      ),
    },
  },
});
