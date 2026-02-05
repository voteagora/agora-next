export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";

import { requireNotificationPreferencesAuth } from "@/app/api/v1/notification-preferences/auth";
import { notificationCenterClient } from "@/lib/notification-center/client";
import type { ChannelType } from "@/lib/notification-center/types";

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ channel: string }> }
) {
  const auth = await requireNotificationPreferencesAuth(request);
  if (!auth.ok) return auth.response;

  const { channel } = await params;

  if (!isValidChannel(channel)) {
    return NextResponse.json(
      { message: `Invalid channel: ${channel}` },
      { status: 400 }
    );
  }

  try {
    await notificationCenterClient.deleteChannel(auth.recipientId, channel);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Failed to delete ${channel} channel`, error);
    return NextResponse.json(
      { message: `Failed to disconnect ${channel}` },
      { status: 500 }
    );
  }
}
