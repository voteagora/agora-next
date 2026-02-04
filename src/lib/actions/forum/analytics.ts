"use server";

import { z } from "zod";
import { handlePrismaError } from "./shared";
import { ViewTracker } from "@/lib/redis";
import Tenant from "@/lib/tenant/tenant";
import { prismaWeb2Client } from "@/app/lib/prisma";

const { slug } = Tenant.current();

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
