export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { requireNotificationPreferencesAuth } from "@/app/api/v1/notification-preferences/auth";
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
    return NextResponse.json(
      { message: "Invalid request payload" },
      { status: 400 }
    );
  }

  try {
    const result = await notificationCenterClient.validateWebhook(
      parsed.data.channel,
      parsed.data.url
    );

    if (!result) {
      return NextResponse.json(
        { valid: false, errors: ["Validation service unavailable"] },
        { status: 200 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to validate webhook", error);
    return NextResponse.json(
      { valid: false, errors: ["Failed to validate webhook"] },
      { status: 200 }
    );
  }
}
