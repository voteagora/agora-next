/*
 * TanStack Start port of src/app/api/v1/notification-preferences/email/verify/initiate/route.ts.
 * URL: POST /api/v1/notification-preferences/email/verify/initiate
 */

import { createFileRoute } from "@tanstack/react-router";

import { requireNotificationPreferencesAuth } from "@/lib/notification-preferences/auth";
import { ensureNotificationRecipient } from "@/lib/notification-preferences/recipient";
import { notificationCenterClient } from "@/lib/notification-center/client";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute(
  "/api/v1/notification-preferences/email/verify/initiate"
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
              await notificationCenterClient.initiateEmailVerification(
                auth.recipientId
              );
            return Response.json(response);
          } catch (error) {
            console.error("Failed to initiate email verification", error);
            return Response.json(
              { message: "Failed to initiate email verification" },
              { status: 500 }
            );
          }
        },
        { skipAuth: true }
      ),
    },
  },
});
