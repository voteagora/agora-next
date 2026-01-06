export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { requireNotificationPreferencesAuth } from "@/app/api/v1/notification-preferences/auth";
import { ensureNotificationRecipient } from "@/app/api/v1/notification-preferences/recipient";
import { notificationCenterClient } from "@/lib/notification-center/client";

const BodySchema = z.object({
  eventType: z.string().min(1),
  channel: z.enum(["email", "discord", "telegram", "slack"]),
  state: z.enum(["on", "off"]),
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

  try {
    await ensureNotificationRecipient(auth.recipientId);
    const response = await notificationCenterClient.setPreference(
      auth.recipientId,
      parsed.data.eventType,
      parsed.data.channel,
      parsed.data.state
    );
    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to update notification preference", error);
    return NextResponse.json(
      { message: "Failed to update notification preference" },
      { status: 500 }
    );
  }
}

