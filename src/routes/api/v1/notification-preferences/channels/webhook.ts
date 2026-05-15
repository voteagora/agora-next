/*
 * TanStack Start port of src/app/api/v1/notification-preferences/channels/webhook/route.ts.
 * URL: POST /api/v1/notification-preferences/channels/webhook
 */

import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { requireNotificationPreferencesAuth } from "@/app/api/v1/notification-preferences/auth";
import { ensureNotificationRecipient } from "@/app/api/v1/notification-preferences/recipient";
import { notificationCenterClient } from "@/lib/notification-center/client";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

const BodySchema = z.object({
  channel: z.enum(["discord", "slack"]),
  url: z.string().url(),
});

export const Route = createFileRoute(
  "/api/v1/notification-preferences/channels/webhook"
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

          const payload =
            parsed.data.channel === "discord"
              ? {
                  type: "discord" as const,
                  delivery_type: "webhook" as const,
                  webhook_url: parsed.data.url,
                }
              : {
                  type: "slack" as const,
                  webhook_url: parsed.data.url,
                };

          try {
            await ensureNotificationRecipient(auth.recipientId);
            const response = await notificationCenterClient.updateChannel(
              auth.recipientId,
              parsed.data.channel,
              payload
            );
            return Response.json(response);
          } catch (error) {
            console.error("Failed to update webhook channel", error);
            return Response.json(
              { message: "Failed to update webhook channel" },
              { status: 500 }
            );
          }
        },
        { skipAuth: true }
      ),
    },
  },
});
