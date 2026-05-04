import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { type DaoSlug } from "@prisma/client";

type FinancialMetricRow = Awaited<
  ReturnType<typeof db.daoFinancialMetrics.findMany>
>[number];

function isDeletedMetric(row: FinancialMetricRow) {
  if (!row.data || typeof row.data !== "object" || Array.isArray(row.data)) {
    return false;
  }

  return "__deleted" in row.data;
}

async function filterRevealedMetrics(
  rows: FinancialMetricRow[],
  daoSlug: DaoSlug,
  now: Date
) {
  const topicIds = [
    ...new Set(
      rows.map((row) => row.topic_id).filter((id): id is number => id !== null)
    ),
  ];

  if (topicIds.length === 0) {
    return rows;
  }

  const revealedTopics = await db.forumTopic.findMany({
    where: {
      id: { in: topicIds },
      dao_slug: daoSlug,
      isFinancialStatement: true,
      OR: [{ revealTime: null }, { revealTime: { lte: now } }],
    },
    select: {
      id: true,
    },
  });
  const revealedTopicIds = new Set(revealedTopics.map((topic) => topic.id));

  return rows.filter(
    (row) =>
      row.topic_id === null || revealedTopicIds.has(row.topic_id as number)
  );
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const daoSlug = searchParams.get("daoSlug") as DaoSlug | null;

  if (!daoSlug) {
    return NextResponse.json(
      { error: "daoSlug parameter is required" },
      { status: 400 }
    );
  }

  try {
    const now = new Date();
    const rows = await db.daoFinancialMetrics.findMany({
      where: {
        dao_slug: daoSlug,
      },
      orderBy: [{ year: "desc" }, { month: "desc" }, { updatedAt: "desc" }],
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

    // Hide tombstoned rows used by admin soft-delete fallback.
    const activeRows = rows.filter((row) => !isDeletedMetric(row));
    const revealedRows = await filterRevealedMetrics(activeRows, daoSlug, now);
    const metrics = revealedRows.slice(0, 2);

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error("Error fetching financial metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch financial metrics" },
      { status: 500 }
    );
  }
}
