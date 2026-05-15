/*
 * TanStack Start port of src/app/api/common/notifications/config/route.ts.
 * URL: GET /api/common/notifications/config
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/common/notifications/config")({
  server: {
    handlers: {
      GET: withApiAuth(async () => {
        const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;

        if (!vapidPublicKey) {
          return Response.json(
            { error: "VAPID Public Key not configured" },
            { status: 500 }
          );
        }

        return Response.json({ vapidPublicKey });
      }),
    },
  },
});
