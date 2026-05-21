/*
 * TanStack Start port of src/app/api/forum/settings/route.ts.
 * URL: GET /api/forum/settings
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/forum/settings")({
  server: {
    handlers: {
      GET: withApiAuth(async ({ request }) => {
        const { prismaWeb2Client } = await import("@/lib/prisma");
        const { Prisma } = await import("@prisma/client");

        try {
          const { searchParams } = new URL(request.url);
          const daoSlug = searchParams.get("daoSlug");

          if (!daoSlug) {
            return Response.json(
              { error: "daoSlug is required" },
              { status: 400 }
            );
          }

          const result = await prismaWeb2Client.$queryRaw<
            Array<{
              min_vp_for_topics: number;
              min_vp_for_replies: number;
              min_vp_for_actions: number;
              min_vp_for_proposals: number;
            }>
          >(
            Prisma.sql`
              SELECT min_vp_for_topics, min_vp_for_replies, min_vp_for_actions, min_vp_for_proposals
              FROM alltenant.dao_forum_settings
              WHERE dao_slug = ${daoSlug}
            `
          );

          if (result.length === 0) {
            return Response.json({
              minVpForTopics: 1,
              minVpForReplies: 1,
              minVpForActions: 1,
              minVpForProposals: 1,
            });
          }

          return Response.json({
            minVpForTopics: result[0].min_vp_for_topics,
            minVpForReplies: result[0].min_vp_for_replies,
            minVpForActions: result[0].min_vp_for_actions,
            minVpForProposals: result[0].min_vp_for_proposals,
          });
        } catch (error) {
          console.error("Failed to fetch forum settings:", error);
          return Response.json(
            { error: "Failed to fetch forum settings" },
            { status: 500 }
          );
        }
      }),
    },
  },
});
