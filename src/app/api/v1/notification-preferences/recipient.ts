import "server-only";

import { notificationCenterClient } from "@/lib/notification-center/client";
import type { RecipientType } from "@/lib/notification-center/types";

const DEFAULT_RECIPIENT_TYPE: RecipientType = "wallet_address";

export async function ensureNotificationRecipient(
  recipientId: string
): Promise<void> {
  const normalizedId = recipientId.toLowerCase();

  const existing = await notificationCenterClient.getRecipient(normalizedId);
  if (existing) {
    return;
  }

  await notificationCenterClient.createRecipient({
    recipient_id: normalizedId,
    recipient_type: DEFAULT_RECIPIENT_TYPE,
  });
}
