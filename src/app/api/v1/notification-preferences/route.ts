export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";

import { requireNotificationPreferencesAuth } from "@/app/api/v1/notification-preferences/auth";
import { notificationCenterClient } from "@/lib/notification-center/client";
import { resolveEventTypes } from "@/lib/notification-center/eventTypes.server";

export async function GET(request: NextRequest) {
  const auth = await requireNotificationPreferencesAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const [recipient, preferences, eventTypes] = await Promise.all([
      notificationCenterClient.getRecipient(auth.recipientId),
      notificationCenterClient.getPreferences(auth.recipientId),
      resolveEventTypes(),
    ]);

    return NextResponse.json({
      recipient,
      preferences,
      eventTypes,
    });
  } catch (error) {
    console.error("Failed to load notification settings", error);
    return NextResponse.json(
      { message: "Failed to load notification settings" },
      { status: 500 }
    );
  }
}
