export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireNotificationPreferencesAuth } from "@/app/api/v1/notification-preferences/auth";
import { notificationCenterClient } from "@/lib/notification-center/client";
import Tenant from "@/lib/tenant/tenant";

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

export async function POST(request: NextRequest) {
  const auth = await requireNotificationPreferencesAuth(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
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
      attributes: {
        tenant: namespace,
      },
    });

    await notificationCenterClient.updateChannel(recipientId, "pwa", {
      type: "pwa",
      endpoint: parsed.data.subscription.endpoint,
      keys: parsed.data.subscription.keys,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Proxy Subscription Error:", error);
    return NextResponse.json(
      { error: "Failed to configure PWA channel" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireNotificationPreferencesAuth(request);
  if (!auth.ok) return auth.response;

  try {
    await notificationCenterClient.deleteChannel(auth.recipientId, "pwa");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Proxy Unsubscribe Error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect PWA channel" },
      { status: 500 }
    );
  }
}
