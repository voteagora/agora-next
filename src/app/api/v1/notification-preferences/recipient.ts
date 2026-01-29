import "server-only";

import { notificationCenterClient } from "@/lib/notification-center/client";
import { fetchUserForumEngagement } from "@/lib/notification-center/backfill";
import type { RecipientType } from "@/lib/notification-center/types";
import Tenant from "@/lib/tenant/tenant";
import type { DaoSlug } from "@prisma/client";

const DEFAULT_RECIPIENT_TYPE: RecipientType = "wallet_address";

export async function ensureNotificationRecipient(
  recipientId: string
): Promise<void> {
  const normalizedId = recipientId.toLowerCase();

  const existing = await notificationCenterClient.getRecipient(normalizedId);
  if (existing) {
    return;
  }

  const { slug } = Tenant.current();
  const engagement = await fetchUserForumEngagement(
    normalizedId,
    slug as DaoSlug
  );

  const attributes: Record<string, number[]> = {};
  if (engagement.authored_topics.length > 0) {
    attributes.authored_topics = engagement.authored_topics;
  }
  if (engagement.engaged_topics.length > 0) {
    attributes.engaged_topics = engagement.engaged_topics;
  }

  await notificationCenterClient.createRecipient({
    recipient_id: normalizedId,
    recipient_type: DEFAULT_RECIPIENT_TYPE,
    ...(Object.keys(attributes).length > 0 ? { attributes } : {}),
  });
}
