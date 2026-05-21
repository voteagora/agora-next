import { validateBearerToken } from "@/lib/auth/edgeAuth";
import Tenant from "@/lib/tenant/tenant";

const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export type NotificationPreferencesAuthResult =
  | { ok: true; recipientId: string }
  | { ok: false; response: Response };

export async function requireNotificationPreferencesAuth(
  request: Request
): Promise<NotificationPreferencesAuthResult> {
  const { ui } = Tenant.current();
  if (!ui.toggle("notifications")?.enabled) {
    return {
      ok: false,
      response: Response.json(
        { message: "Notifications not enabled for this tenant" },
        { status: 403 }
      ),
    };
  }

  const auth = await validateBearerToken(request);
  if (!auth.authenticated || auth.type !== "jwt" || !auth.userId) {
    return {
      ok: false,
      response: Response.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!ETH_ADDRESS_REGEX.test(auth.userId)) {
    return {
      ok: false,
      response: Response.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  return { ok: true, recipientId: auth.userId.toLowerCase() };
}
