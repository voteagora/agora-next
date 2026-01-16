export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";

import { requireNotificationPreferencesAuth } from "@/app/api/v1/notification-preferences/auth";
import { ensureNotificationRecipient } from "@/app/api/v1/notification-preferences/recipient";
import { notificationCenterClient } from "@/lib/notification-center/client";

export async function POST(request: NextRequest) {
  const auth = await requireNotificationPreferencesAuth(request);
  if (!auth.ok) return auth.response;

  try {
    await ensureNotificationRecipient(auth.recipientId);
    const response = await notificationCenterClient.initiateTelegramLinking(
      auth.recipientId
    );
    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to initiate telegram linking", error);
    return NextResponse.json(
      { message: "Failed to initiate telegram linking" },
      { status: 500 }
    );
  }
}
