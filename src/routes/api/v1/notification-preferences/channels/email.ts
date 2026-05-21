/*
 * TanStack Start port of src/app/api/v1/notification-preferences/channels/email/route.ts.
 * URL: POST /api/v1/notification-preferences/channels/email
 *      DELETE /api/v1/notification-preferences/channels/email
 */

import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { requireNotificationPreferencesAuth } from "@/lib/notification-preferences/auth";
import { ensureNotificationRecipient } from "@/lib/notification-preferences/recipient";
import { notificationCenterClient } from "@/lib/notification-center/client";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

const BodySchema = z.object({
  email: z.string().email(),
});

export const Route = createFileRoute(
  "/api/v1/notification-preferences/channels/email"
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
              { message: "Invalid email address" },
              { status: 400 }
            );
          }

          try {
            await ensureNotificationRecipient(auth.recipientId);
            const response = await notificationCenterClient.updateChannel(
              auth.recipientId,
              "email",
              {
                type: "email",
                address: parsed.data.email,
                verified: false,
              }
            );
            return Response.json(response);
          } catch (error) {
            console.error("Failed to update email channel", error);
            return Response.json(
              { message: "Failed to update email channel" },
              { status: 500 }
            );
          }
        },
        { skipAuth: true }
      ),

      DELETE: withApiAuth(
        async ({ request }) => {
          const auth = await requireNotificationPreferencesAuth(
            request as never
          );
          if (!auth.ok) return auth.response;

          try {
            await notificationCenterClient.deleteChannel(
              auth.recipientId,
              "email"
            );
            return Response.json({ success: true });
          } catch (error) {
            console.error("Failed to delete email channel", error);
            return Response.json(
              { message: "Failed to disconnect email" },
              { status: 500 }
            );
          }
        },
        { skipAuth: true }
      ),
    },
  },
});
