import { NextResponse, type NextRequest } from "next/server";

import { validateBearerToken } from "@/app/lib/auth/edgeAuth";

const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export type NotificationPreferencesAuthResult =
  | { ok: true; recipientId: string }
  | { ok: false; response: NextResponse };

export async function requireNotificationPreferencesAuth(
  request: NextRequest
): Promise<NotificationPreferencesAuthResult> {
  const auth = await validateBearerToken(request);
  if (!auth.authenticated || auth.type !== "jwt" || !auth.userId) {
    return {
      ok: false,
      response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!ETH_ADDRESS_REGEX.test(auth.userId)) {
    return {
      ok: false,
      response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  return { ok: true, recipientId: auth.userId.toLowerCase() };
}
