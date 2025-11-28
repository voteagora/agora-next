"use server";

import { z } from "zod";
import { handlePrismaError } from "./shared";
import { ViewTracker } from "@/lib/redis";
import verifyMessage from "@/lib/serverVerifyMessage";
import Tenant from "@/lib/tenant/tenant";
import { prismaWeb2Client } from "@/app/lib/web2";

const { slug } = Tenant.current();

const subscriptionSchema = z.object({
  targetType: z.enum(["topic", "category"]),
  targetId: z.number().min(1, "Target ID is required"),
  address: z.string().min(1, "Address is required"),
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Signed message is required"),
});

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
  data: z.infer<typeof subscriptionSchema>
) {
  try {
    const validatedData = subscriptionSchema.parse(data);

    const isValid = await verifyMessage({
      address: validatedData.address as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    let existingSubscription;
    let subscription;

    if (validatedData.targetType === "topic") {
      // Check if already subscribed to topic
      existingSubscription =
        await prismaWeb2Client.forumTopicSubscription.findUnique({
          where: {
            dao_slug_address_topicId: {
              dao_slug: slug,
              address: validatedData.address.toLowerCase(),
              topicId: validatedData.targetId,
            },
          },
        });

      if (existingSubscription) {
        return {
          success: false,
          error: "Already subscribed to this content",
        };
      }

      // Create topic subscription
      subscription = await prismaWeb2Client.forumTopicSubscription.create({
        data: {
          dao_slug: slug,
          address: validatedData.address.toLowerCase(),
          topicId: validatedData.targetId,
        },
      });
    } else if (validatedData.targetType === "category") {
      // Check if already subscribed to category
      existingSubscription =
        await prismaWeb2Client.forumCategorySubscription.findUnique({
          where: {
            dao_slug_address_categoryId: {
              dao_slug: slug,
              address: validatedData.address.toLowerCase(),
              categoryId: validatedData.targetId,
            },
          },
        });

      if (existingSubscription) {
        return {
          success: false,
          error: "Already subscribed to this content",
        };
      }

      // Create category subscription
      subscription = await prismaWeb2Client.forumCategorySubscription.create({
        data: {
          dao_slug: slug,
          address: validatedData.address.toLowerCase(),
          categoryId: validatedData.targetId,
        },
      });
    }

    return {
      success: true,
      data: subscription,
    };
  } catch (error) {
    console.error("Error subscribing to forum content:", error);
    return handlePrismaError(error);
  }
}

export async function unsubscribeFromForumContent(
  data: z.infer<typeof subscriptionSchema>
) {
  try {
    const validatedData = subscriptionSchema.parse(data);

    const isValid = await verifyMessage({
      address: validatedData.address as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    // Remove subscription
    let deletedSubscription;

    if (validatedData.targetType === "topic") {
      deletedSubscription =
        await prismaWeb2Client.forumTopicSubscription.delete({
          where: {
            dao_slug_address_topicId: {
              dao_slug: slug,
              address: validatedData.address.toLowerCase(),
              topicId: validatedData.targetId,
            },
          },
        });
    } else if (validatedData.targetType === "category") {
      deletedSubscription =
        await prismaWeb2Client.forumCategorySubscription.delete({
          where: {
            dao_slug_address_categoryId: {
              dao_slug: slug,
              address: validatedData.address.toLowerCase(),
              categoryId: validatedData.targetId,
            },
          },
        });
    }

    return {
      success: true,
      data: deletedSubscription,
    };
  } catch (error) {
    console.error("Error unsubscribing from forum content:", error);
    return handlePrismaError(error);
  }
}

export async function getForumSubscriptions(address: string) {
  try {
    const topicSubscriptions =
      await prismaWeb2Client.forumTopicSubscription.findMany({
        where: {
          dao_slug: slug,
          address: address.toLowerCase(),
        },
        orderBy: { createdAt: "desc" },
      });

    const categorySubscriptions =
      await prismaWeb2Client.forumCategorySubscription.findMany({
        where: {
          dao_slug: slug,
          address: address.toLowerCase(),
        },
        orderBy: { createdAt: "desc" },
      });
    return {
      success: true,
      data: {
        topicSubscriptions,
        categorySubscriptions,
      },
    };
  } catch (error) {
    console.error("Error getting forum subscriptions:", error);
    return handlePrismaError(error);
  }
}
