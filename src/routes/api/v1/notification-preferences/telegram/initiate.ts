/*
 * TanStack Start port of src/app/api/v1/notification-preferences/telegram/initiate/route.ts.
 * URL: POST /api/v1/notification-preferences/telegram/initiate
 */

import { createFileRoute } from "@tanstack/react-router";

import { requireNotificationPreferencesAuth } from "@/lib/notification-preferences/auth";
import { ensureNotificationRecipient } from "@/lib/notification-preferences/recipient";
import { notificationCenterClient } from "@/lib/notification-center/client";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute(
  "/api/v1/notification-preferences/telegram/initiate"
)({
  server: {
    handlers: {
      POST: withApiAuth(
        async ({ request }) => {
          const auth = await requireNotificationPreferencesAuth(
            request as never
          );
          if (!auth.ok) return auth.response;

          try {
            await ensureNotificationRecipient(auth.recipientId);
            const response =
              await notificationCenterClient.initiateTelegramLinking(
                auth.recipientId
              );
            return Response.json(response);
          } catch (error) {
            console.error("Failed to initiate telegram linking", error);
            return Response.json(
              { message: "Failed to initiate telegram linking" },
              { status: 500 }
            );
          }
        },
        { skipAuth: true }
      ),
    },
  },
});
