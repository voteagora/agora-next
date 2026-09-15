export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { requireNotificationPreferencesAuth } from "@/app/api/v1/notification-preferences/auth";
import { ensureNotificationRecipient } from "@/app/api/v1/notification-preferences/recipient";
import { notificationCenterClient } from "@/lib/notification-center/client";
import { withApiRouteMonitoring } from "@/lib/apiMonitoring";
import Tenant from "@/lib/tenant/tenant";

const BodySchema = z.object({
  email: z.string().email(),
  privyVerified: z.boolean().optional(),
});

async function post(request: NextRequest) {
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
    return NextResponse.json(
      { message: "Invalid email address" },
      { status: 400 }
    );
  }

  const { ui } = Tenant.current();
  const isPrivyEnabled = ui.toggle("privy-login")?.enabled === true;
  const verified = isPrivyEnabled && parsed.data.privyVerified === true;
  console.log(
    "[privy-debug][server][email-channel]",
    JSON.stringify({
      t: new Date().toISOString(),
      event: "update",
      recipientId: auth.recipientId,
      isPrivyEnabled,
      privyVerifiedClaimed: parsed.data.privyVerified === true,
      verified,
    })
  );

  try {
    await ensureNotificationRecipient(auth.recipientId);
    const response = await notificationCenterClient.updateChannel(
      auth.recipientId,
      "email",
      {
        type: "email",
        address: parsed.data.email,
        verified,
      }
    );
    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to update email channel", error);
    return NextResponse.json(
      { message: "Failed to update email channel" },
      { status: 500 }
    );
  }
}

async function del(request: NextRequest) {
  const auth = await requireNotificationPreferencesAuth(request);
  if (!auth.ok) return auth.response;

  try {
    await notificationCenterClient.deleteChannel(auth.recipientId, "email");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete email channel", error);
    return NextResponse.json(
      { message: "Failed to disconnect email" },
      { status: 500 }
    );
  }
}

export const POST = withApiRouteMonitoring(
  "api.notification_preferences.channels.email.update",
  post
);
export const DELETE = withApiRouteMonitoring(
  "api.notification_preferences.channels.email.delete",
  del
);
