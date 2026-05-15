/*
 * TanStack Start port of src/app/api/duna/financial-metrics/route.ts.
 * URL: GET /api/duna/financial-metrics
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/duna/financial-metrics")({
  server: {
    handlers: {
      GET: withApiAuth(async ({ request }) => {
        const { db } = await import("@/server/db");

        const searchParams = new URL(request.url).searchParams;
        const daoSlug = searchParams.get("daoSlug") as string | null;

        if (!daoSlug) {
          return Response.json(
            { error: "daoSlug parameter is required" },
            { status: 400 }
          );
        }

        try {
          const now = new Date();
          const rows = await db.daoFinancialMetrics.findMany({
            where: { dao_slug: daoSlug as never },
            orderBy: [
              { year: "desc" },
              { month: "desc" },
              { updatedAt: "desc" },
            ],
            select: {
              id: true,
              dao_slug: true,
              topic_id: true,
              year: true,
              month: true,
              data: true,
              createdAt: true,
              updatedAt: true,
            },
          });

          function isDeletedMetric(row: (typeof rows)[number]) {
            if (
              !row.data ||
              typeof row.data !== "object" ||
              Array.isArray(row.data)
            ) {
              return false;
            }
            return "__deleted" in row.data;
          }

          const activeRows = rows.filter((row) => !isDeletedMetric(row));

          const topicIds = [
            ...new Set(
              activeRows
                .map((row) => row.topic_id)
                .filter((id): id is number => id !== null)
            ),
          ];

          let revealedRows = activeRows;
          if (topicIds.length > 0) {
            const revealedTopics = await db.forumTopic.findMany({
              where: {
                id: { in: topicIds },
                dao_slug: daoSlug as never,
                isFinancialStatement: true,
                OR: [{ revealTime: null }, { revealTime: { lte: now } }],
              },
              select: { id: true },
            });
            const revealedTopicIds = new Set(
              revealedTopics.map((topic) => topic.id)
            );
            revealedRows = activeRows.filter(
              (row) =>
                row.topic_id === null ||
                revealedTopicIds.has(row.topic_id as number)
            );
          }

          const metrics = revealedRows.slice(0, 2);
          return Response.json({ metrics });
        } catch (error) {
          console.error("Error fetching financial metrics:", error);
          return Response.json(
            { error: "Failed to fetch financial metrics" },
            { status: 500 }
          );
        }
      }),
    },
  },
});
