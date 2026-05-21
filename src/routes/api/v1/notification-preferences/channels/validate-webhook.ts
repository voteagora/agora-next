/*
 * TanStack Start port of src/app/api/v1/notification-preferences/channels/validate-webhook/route.ts.
 * URL: POST /api/v1/notification-preferences/channels/validate-webhook
 */

import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { requireNotificationPreferencesAuth } from "@/lib/notification-preferences/auth";
import { notificationCenterClient } from "@/lib/notification-center/client";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

const BodySchema = z.object({
  channel: z.enum(["discord", "slack"]),
  url: z.string().url(),
});

export const Route = createFileRoute(
  "/api/v1/notification-preferences/channels/validate-webhook"
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

          try {
            const result = await notificationCenterClient.validateWebhook(
              parsed.data.channel,
              parsed.data.url
            );
            if (!result) {
              return Response.json(
                { valid: false, errors: ["Validation service unavailable"] },
                { status: 200 }
              );
            }
            return Response.json(result);
          } catch (error) {
            console.error("Failed to validate webhook", error);
            return Response.json(
              { valid: false, errors: ["Failed to validate webhook"] },
              { status: 200 }
            );
          }
        },
        { skipAuth: true }
      ),
    },
  },
});
