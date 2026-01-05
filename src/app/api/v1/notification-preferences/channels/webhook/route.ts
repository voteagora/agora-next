export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { requireNotificationPreferencesAuth } from "@/app/api/v1/notification-preferences/auth";
import { ensureNotificationRecipient } from "@/app/api/v1/notification-preferences/recipient";
import { notificationCenterClient } from "@/lib/notification-center/client";

const BodySchema = z.object({
  channel: z.enum(["discord", "slack"]),
  url: z.string().url(),
});

export async function POST(request: NextRequest) {
  const auth = await requireNotificationPreferencesAuth(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid request payload" }, { status: 400 });
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
    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to update webhook channel", error);
    return NextResponse.json({ message: "Failed to update webhook channel" }, { status: 500 });
  }
}

