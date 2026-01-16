import { notificationCenterClient } from "@/lib/notification-center/client";
import type { RecipientType } from "@/lib/notification-center/types";

const DEFAULT_RECIPIENT_TYPE: RecipientType = "wallet_address";

export async function ensureNotificationRecipient(
  recipientId: string
): Promise<void> {
  await notificationCenterClient.createRecipient({
    recipient_id: recipientId,
    recipient_type: DEFAULT_RECIPIENT_TYPE,
  });
}
