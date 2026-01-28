"use server";

import { z } from "zod";
import {
  addRecipientAttributeValueAtomic,
  removeRecipientAttributeValueAtomic,
} from "@/lib/notification-center/emitter";
import { notificationCenterClient } from "@/lib/notification-center/client";
import {
  FORUM_SUBSCRIPTIONS_ACTIONS,
  FORUM_SUBSCRIPTIONS_PRIMARY_TYPE,
  FORUM_SUBSCRIPTIONS_TYPED_DATA_DOMAIN,
  FORUM_SUBSCRIPTIONS_TYPED_DATA_TYPES,
  type ForumSubscriptionsAction,
  hashForumSubscriptionsPayload,
} from "@/lib/forumSubscriptionsSignedRequests";
import { verifyEip712Signature } from "@/lib/crypto/verifyEip712Signature";
import Tenant from "@/lib/tenant/tenant";

function isNotificationsEnabled(): boolean {
  const { ui } = Tenant.current();
  return ui.toggle("notifications")?.enabled === true;
}

const signedRequestSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address"),
  signature: z.string().regex(/^0x[0-9a-fA-F]+$/, "Invalid signature"),
  action: z.enum(FORUM_SUBSCRIPTIONS_ACTIONS),
  timestamp: z.number().int().positive(),
  nonce: z.string().min(8).max(200),
  payload: z.unknown(),
});

type SignedRequest = z.infer<typeof signedRequestSchema>;

const SIGNED_REQUEST_MAX_AGE_SECONDS = 10 * 60;

async function verifySignedRequest<TPayload>(params: {
  data: SignedRequest;
  expectedAction: ForumSubscriptionsAction;
  payloadSchema: z.ZodType<TPayload>;
}): Promise<{ recipientId: string; payload: TPayload }> {
  const { data, expectedAction, payloadSchema } = params;
  const validated = signedRequestSchema.parse(data);

  if (validated.action !== expectedAction) {
    throw new Error("Invalid action");
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const ageSeconds = Math.abs(nowSeconds - validated.timestamp);
  if (ageSeconds > SIGNED_REQUEST_MAX_AGE_SECONDS) {
    throw new Error("Signature expired");
  }

  const payload = payloadSchema.parse(validated.payload);
  const payloadHash = hashForumSubscriptionsPayload(payload);

  const message = {
    action: validated.action,
    address: validated.address as `0x${string}`,
    timestamp: BigInt(validated.timestamp),
    nonce: validated.nonce,
    payload_hash: payloadHash,
  } as const;

  const isValid = await verifyEip712Signature({
    address: validated.address as `0x${string}`,
    domain: FORUM_SUBSCRIPTIONS_TYPED_DATA_DOMAIN,
    types: FORUM_SUBSCRIPTIONS_TYPED_DATA_TYPES,
    primaryType: FORUM_SUBSCRIPTIONS_PRIMARY_TYPE,
    message,
    signature: validated.signature as `0x${string}`,
  });

  if (!isValid) {
    throw new Error("Invalid signature");
  }

  return { recipientId: validated.address.toLowerCase(), payload };
}

type ForumSubscriptionsResult = {
  topicSubscriptions: Array<{ topicId: number }>;
  categorySubscriptions: Array<{ categoryId: number }>;
};

const SUBSCRIPTIONS_CACHE_TTL_MS = 30_000;

type CacheEntry = {
  value: ForumSubscriptionsResult;
  expiresAtMs: number;
};

const subscriptionsCache = new Map<string, CacheEntry>();
const subscriptionsInFlight = new Map<
  string,
  Promise<ForumSubscriptionsResult>
>();

function getCacheKey(address: string): string {
  return address.toLowerCase();
}

function getCachedSubscriptions(
  address: string
): ForumSubscriptionsResult | null {
  const key = getCacheKey(address);
  const entry = subscriptionsCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAtMs) {
    subscriptionsCache.delete(key);
    return null;
  }
  return entry.value;
}

function setCachedSubscriptions(
  address: string,
  value: ForumSubscriptionsResult
) {
  const key = getCacheKey(address);
  subscriptionsCache.set(key, {
    value,
    expiresAtMs: Date.now() + SUBSCRIPTIONS_CACHE_TTL_MS,
  });
}

function invalidateCachedSubscriptions(address: string) {
  subscriptionsCache.delete(getCacheKey(address));
  subscriptionsInFlight.delete(getCacheKey(address));
}

export async function subscribeToForumContent(data: SignedRequest) {
  if (!isNotificationsEnabled()) {
    return { success: false, error: "Notifications not enabled" };
  }

  try {
    const { recipientId, payload } = await verifySignedRequest({
      data,
      expectedAction: "subscribe",
      payloadSchema: z.object({
        targetType: z.enum(["topic", "category"]),
        targetId: z.number().int().min(1, "Target ID is required"),
      }),
    });

    if (payload.targetType === "topic") {
      await addRecipientAttributeValueAtomic(
        recipientId,
        "subscribed_topics",
        payload.targetId
      );
    } else if (payload.targetType === "category") {
      await addRecipientAttributeValueAtomic(
        recipientId,
        "subscribed_categories",
        payload.targetId
      );
    }

    invalidateCachedSubscriptions(recipientId);

    return { success: true };
  } catch (error) {
    console.error("Error subscribing to forum content:", error);
    return { success: false, error: "Failed to subscribe" };
  }
}

export async function unsubscribeFromForumContent(data: SignedRequest) {
  if (!isNotificationsEnabled()) {
    return { success: false, error: "Notifications not enabled" };
  }

  try {
    const { recipientId, payload } = await verifySignedRequest({
      data,
      expectedAction: "unsubscribe",
      payloadSchema: z.object({
        targetType: z.enum(["topic", "category"]),
        targetId: z.number().int().min(1, "Target ID is required"),
      }),
    });

    if (payload.targetType === "topic") {
      await removeRecipientAttributeValueAtomic(
        recipientId,
        "subscribed_topics",
        payload.targetId
      );
    } else if (payload.targetType === "category") {
      await removeRecipientAttributeValueAtomic(
        recipientId,
        "subscribed_categories",
        payload.targetId
      );
    }

    invalidateCachedSubscriptions(recipientId);

    return { success: true };
  } catch (error) {
    console.error("Error unsubscribing from forum content:", error);
    return { success: false, error: "Failed to unsubscribe" };
  }
}

export async function getForumSubscriptions(address: string) {
  if (!isNotificationsEnabled()) {
    return {
      success: true,
      data: { topicSubscriptions: [], categorySubscriptions: [] },
    };
  }

  try {
    const recipientId = address.toLowerCase();

    const cached = getCachedSubscriptions(recipientId);
    if (cached) {
      return { success: true, data: cached };
    }

    const inFlightKey = getCacheKey(recipientId);
    const existingInFlight = subscriptionsInFlight.get(inFlightKey);
    if (existingInFlight) {
      const data = await existingInFlight;
      return { success: true, data };
    }

    const fetchPromise = (async (): Promise<ForumSubscriptionsResult> => {
      const recipient =
        await notificationCenterClient.getRecipient(recipientId);

      const attributes =
        (recipient?.attributes as Record<string, unknown>) ?? {};

      const subscribedTopics = Array.isArray(attributes.subscribed_topics)
        ? attributes.subscribed_topics
        : [];
      const subscribedCategories = Array.isArray(
        attributes.subscribed_categories
      )
        ? attributes.subscribed_categories
        : [];

      const result: ForumSubscriptionsResult = {
        topicSubscriptions: subscribedTopics.map((topicId: number) => ({
          topicId,
        })),
        categorySubscriptions: subscribedCategories.map(
          (categoryId: number) => ({
            categoryId,
          })
        ),
      };

      setCachedSubscriptions(recipientId, result);

      return result;
    })();

    subscriptionsInFlight.set(inFlightKey, fetchPromise);
    const data = await fetchPromise.finally(() => {
      subscriptionsInFlight.delete(inFlightKey);
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error getting forum subscriptions:", error);
    return { success: false, error: "Failed to fetch subscriptions" };
  }
}
