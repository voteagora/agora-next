import { NextResponse } from "next/server";
import { ViewTracker } from "@/lib/redis";
import { prismaWeb2Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";

const { slug } = Tenant.current();

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting Redis -> Postgres view sync...");

    const redisTargets = await ViewTracker.getAllTargetsWithOverlay();

    if (redisTargets.length === 0) {
      console.log("No Redis overlays to flush");
      return NextResponse.json({
        success: true,
        message: "No Redis overlays to flush",
        flushed: 0,
      });
    }

    let flushedCount = 0;
    const flushErrors: Array<{ target: string; error: string }> = [];

    console.log(`Flushing ${redisTargets.length} Redis overlays to Postgres`);

    for (const redisTarget of redisTargets) {
      try {
        await prismaWeb2Client.forumTopicViewStats.upsert({
          where: {
            dao_slug_topicId: {
              dao_slug: slug as any,
              topicId: redisTarget.targetId,
            },
          },
          update: {
            views: { increment: redisTarget.overlayCount },
            lastUpdated: new Date(),
          },
          create: {
            dao_slug: slug as any,
            topicId: redisTarget.targetId,
            views: redisTarget.overlayCount,
            lastUpdated: new Date(),
          },
        });

        await ViewTracker.resetCounters(
          redisTarget.targetType,
          redisTarget.targetId
        );

        flushedCount++;

        if (flushedCount % 100 === 0) {
          console.log(
            `Flushed ${flushedCount}/${redisTargets.length} targets...`
          );
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        console.error(
          `Error flushing ${redisTarget.targetType}:${redisTarget.targetId}:`,
          errorMsg
        );

        flushErrors.push({
          target: `${redisTarget.targetType}:${redisTarget.targetId}`,
          error: errorMsg,
        });
      }
    }

    const response = {
      success: true,
      message: `Successfully flushed ${flushedCount}/${redisTargets.length} Redis overlays`,
      summary: {
        total: redisTargets.length,
        flushed: flushedCount,
        failed: flushErrors.length,
      },
      errors: flushErrors.length > 0 ? flushErrors : undefined,
    };

    console.log("Redis -> Postgres flush completed:", {
      flushed: flushedCount,
      errors: flushErrors.length,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Fatal error in forum view sync:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}
