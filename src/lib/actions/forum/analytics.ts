"use server";

import { z } from "zod";
import { handlePrismaError } from "./shared";
import { ViewTracker } from "@/lib/redis";
import Tenant from "@/lib/tenant/tenant";
import { prismaWeb2Client } from "@/app/lib/prisma";
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

const { slug } = Tenant.current();

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

const viewTrackingSchema = z.object({
  targetType: z.enum(["topic"]),
  targetId: z.number().min(1, "Target ID is required"),
  address: z.string().optional(),
  ipHash: z.string().optional(),
});

export async function trackForumView(data: z.infer<typeof viewTrackingSchema>) {
  try {
    const validatedData = viewTrackingSchema.parse(data);

    // Only track view in Redis - Postgres will be updated by cron job
    await ViewTracker.trackView(
      validatedData.targetType,
      validatedData.targetId,
      validatedData.address,
      validatedData.ipHash
    );

    return { success: true };
  } catch (error) {
    console.error("Error tracking forum view:", error);
    return handlePrismaError(error);
  }
}

export async function getForumViewStats(targetType: "topic", targetId: number) {
  try {
    // Get Redis overlay (hot counts) and Postgres base (flushed counts)
    const redisOverlay = await ViewTracker.getRedisOverlay(
      targetType,
      targetId
    );
    const postgresStats = await prismaWeb2Client.forumTopicViewStats.findUnique(
      {
        where: {
          dao_slug_topicId: {
            dao_slug: slug,
            topicId: targetId,
          },
        },
      }
    );

    const postgresViews = postgresStats?.views || 0;
    const totalViews = postgresViews + redisOverlay;

    return {
      success: true,
      data: {
        uniqueViews: totalViews,
        baseViews: postgresViews,
        overlayViews: redisOverlay,
        lastUpdated: postgresStats?.lastUpdated?.toISOString() || null,
        isRealTime: redisOverlay > 0,
        source:
          redisOverlay > 0
            ? ("redis+postgres" as const)
            : ("postgres" as const),
      },
    };
  } catch (error) {
    console.error("Error getting forum view stats:", error);
    return handlePrismaError(error);
  }
}

export async function subscribeToForumContent(
  data: SignedRequest
) {
  try {
    const { recipientId, payload } = await verifySignedRequest({
      data,
      expectedAction: "subscribe",
      payloadSchema: z.object({
        targetType: z.enum(["topic", "category"]),
        targetId: z.number().int().min(1, "Target ID is required"),
      }),
    });

    // Write to Firestore only (via notification center)
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

    return { success: true };
  } catch (error) {
    console.error("Error subscribing to forum content:", error);
    return { success: false, error: "Failed to subscribe" };
  }
}

export async function unsubscribeFromForumContent(
  data: SignedRequest
) {
  try {
    const { recipientId, payload } = await verifySignedRequest({
      data,
      expectedAction: "unsubscribe",
      payloadSchema: z.object({
        targetType: z.enum(["topic", "category"]),
        targetId: z.number().int().min(1, "Target ID is required"),
      }),
    });

    // Remove from Firestore only (via notification center)
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

    return { success: true };
  } catch (error) {
    console.error("Error unsubscribing from forum content:", error);
    return { success: false, error: "Failed to unsubscribe" };
  }
}

export async function getForumSubscriptions(address: string) {
  try {
    const recipientId = address.toLowerCase();

    const recipient = await notificationCenterClient.getRecipient(
      recipientId
    );

    const attributes = (recipient?.attributes as Record<string, unknown>) ?? {};

    return {
      success: true,
      data: {
        topicSubscriptions: (
          Array.isArray(attributes.subscribed_topics)
            ? attributes.subscribed_topics
            : []
        ).map((topicId: number) => ({ topicId })),
        categorySubscriptions: (
          Array.isArray(attributes.subscribed_categories)
            ? attributes.subscribed_categories
            : []
        ).map((categoryId: number) => ({ categoryId })),
      },
    };
  } catch (error) {
    console.error("Error getting forum subscriptions:", error);
    return { success: false, error: "Failed to fetch subscriptions" };
  }
}
