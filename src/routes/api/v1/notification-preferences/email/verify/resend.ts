/*
 * TanStack Start port of src/app/api/v1/notification-preferences/email/verify/resend/route.ts.
 * URL: POST /api/v1/notification-preferences/email/verify/resend
 */

import { createFileRoute } from "@tanstack/react-router";

import { requireNotificationPreferencesAuth } from "@/app/api/v1/notification-preferences/auth";
import { ensureNotificationRecipient } from "@/app/api/v1/notification-preferences/recipient";
import { notificationCenterClient } from "@/lib/notification-center/client";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute(
  "/api/v1/notification-preferences/email/verify/resend"
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
              await notificationCenterClient.resendEmailVerification(
                auth.recipientId
              );
            return Response.json(response);
          } catch (error) {
            console.error("Failed to resend email verification", error);
            return Response.json(
              { message: "Failed to resend email verification" },
              { status: 500 }
            );
          }
        },
        { skipAuth: true }
      ),
    },
  },
});
