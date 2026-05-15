/*
 * TanStack Start port of src/app/api/common/notifications/subscriptions/route.ts.
 * URL: POST|DELETE /api/common/notifications/subscriptions
 */

import { createFileRoute } from "@tanstack/react-router";

import { notificationCenterClient } from "@/lib/notification-center/client";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/common/notifications/subscriptions")(
  {
    server: {
      handlers: {
        POST: withApiAuth(
          async ({ request }) => {
            const { requireNotificationPreferencesAuth } = await import(
              "@/app/api/v1/notification-preferences/auth"
            );
            const { default: Tenant } = await import("@/lib/tenant/tenant");
            const { z } = await import("zod");

            const SubscriptionSchema = z.object({
              endpoint: z.string().url(),
              keys: z.object({
                p256dh: z.string().min(1),
                auth: z.string().min(1),
              }),
            });
            const BodySchema = z.object({
              subscription: SubscriptionSchema,
            });

            const auth = await requireNotificationPreferencesAuth(
              request as never
            );
            if (!auth.ok) return auth.response;

            let body: unknown;
            try {
              body = await request.json();
            } catch {
              return Response.json({ error: "Invalid JSON" }, { status: 400 });
            }

            const parsed = BodySchema.safeParse(body);
            if (!parsed.success) {
              return Response.json(
                { error: "Invalid subscription payload" },
                { status: 400 }
              );
            }

            const { namespace } = Tenant.current();
            const recipientId = auth.recipientId;

            try {
              await notificationCenterClient.createRecipient({
                recipient_id: recipientId,
                recipient_type: "wallet_address",
                attributes: { tenant: namespace },
              });

              await notificationCenterClient.updateChannel(recipientId, "pwa", {
                type: "pwa",
                endpoint: parsed.data.subscription.endpoint,
                keys: parsed.data.subscription.keys,
              });

              return Response.json({ success: true });
            } catch (error) {
              console.error("Proxy Subscription Error:", error);
              return Response.json(
                { error: "Failed to configure PWA channel" },
                { status: 500 }
              );
            }
          },
          { skipAuth: true }
        ),

        DELETE: withApiAuth(
          async ({ request }) => {
            const { requireNotificationPreferencesAuth } = await import(
              "@/app/api/v1/notification-preferences/auth"
            );

            const auth = await requireNotificationPreferencesAuth(
              request as never
            );
            if (!auth.ok) return auth.response;

            try {
              await notificationCenterClient.deleteChannel(
                auth.recipientId,
                "pwa"
              );
              return Response.json({ success: true });
            } catch (error) {
              console.error("Proxy Unsubscribe Error:", error);
              return Response.json(
                { error: "Failed to disconnect PWA channel" },
                { status: 500 }
              );
            }
          },
          { skipAuth: true }
        ),
      },
    },
  }
);
