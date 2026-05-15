/*
 * TanStack Start port of src/app/api/v1/forum/sync-views/route.ts.
 * Cron-secret authorization, not standard bearer-token.
 *
 * URL: POST /api/v1/forum/sync-views
 */

import { createFileRoute } from "@tanstack/react-router";

import { ViewTracker } from "@/lib/redis";
import { prismaWeb2Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/v1/forum/sync-views")({
  server: {
    handlers: {
      POST: withApiAuth(
        async ({ request }) => {
          try {
            const authHeader = request.headers.get("authorization");
            const cronSecret = process.env.CRON_SECRET;
            if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
              return Response.json({ error: "Unauthorized" }, { status: 401 });
            }

            // Tenant.current() moved inside the handler — module-load semantics
            // differ vs Next, and we don't want tenant resolution at import time.
            const { slug } = Tenant.current();

            const redisTargets = await ViewTracker.getAllTargetsWithOverlay();
            if (redisTargets.length === 0) {
              return Response.json({
                success: true,
                message: "No Redis overlays to flush",
                flushed: 0,
              });
            }

            let flushedCount = 0;
            const flushErrors: Array<{ target: string; error: string }> = [];

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
              } catch (error) {
                const errorMsg =
                  error instanceof Error ? error.message : "Unknown error";
                flushErrors.push({
                  target: `${redisTarget.targetType}:${redisTarget.targetId}`,
                  error: errorMsg,
                });
              }
            }

            return Response.json({
              success: true,
              message: `Successfully flushed ${flushedCount}/${redisTargets.length} Redis overlays`,
              summary: {
                total: redisTargets.length,
                flushed: flushedCount,
                failed: flushErrors.length,
              },
              errors: flushErrors.length > 0 ? flushErrors : undefined,
            });
          } catch (error) {
            console.error("Fatal error in forum view sync:", error);
            return Response.json(
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
        },
        { skipAuth: true }
      ),
    },
  },
});
