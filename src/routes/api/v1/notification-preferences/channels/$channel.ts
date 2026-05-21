/*
 * TanStack Start port of src/app/api/v1/notification-preferences/channels/[channel]/route.ts.
 * URL: DELETE /api/v1/notification-preferences/channels/:channel
 */

import { createFileRoute } from "@tanstack/react-router";

import { requireNotificationPreferencesAuth } from "@/lib/notification-preferences/auth";
import { notificationCenterClient } from "@/lib/notification-center/client";
import type { ChannelType } from "@/lib/notification-center/types";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

const VALID_CHANNELS: ChannelType[] = [
  "email",
  "telegram",
  "discord",
  "slack",
  "pwa",
];

function isValidChannel(channel: string): channel is ChannelType {
  return VALID_CHANNELS.includes(channel as ChannelType);
}

export const Route = createFileRoute(
  "/api/v1/notification-preferences/channels/$channel"
)({
  server: {
    handlers: {
      DELETE: withApiAuth(
        async ({ request, params }) => {
          const auth = await requireNotificationPreferencesAuth(
            request as never
          );
          if (!auth.ok) return auth.response;

          const { channel } = params;

          if (!isValidChannel(channel)) {
            return Response.json(
              { message: `Invalid channel: ${channel}` },
              { status: 400 }
            );
          }

          try {
            await notificationCenterClient.deleteChannel(
              auth.recipientId,
              channel
            );
            return Response.json({ success: true });
          } catch (error) {
            console.error(`Failed to delete ${channel} channel`, error);
            return Response.json(
              { message: `Failed to disconnect ${channel}` },
              { status: 500 }
            );
          }
        },
        { skipAuth: true }
      ),
    },
  },
});
