import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { type DaoSlug } from "@prisma/client";

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
    const metrics = rows
      .filter((row) => {
        if (!row.data || typeof row.data !== "object" || Array.isArray(row.data)) {
          return true;
        }
        return !("__deleted" in row.data);
      })
      .slice(0, 2);

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error("Error fetching financial metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch financial metrics" },
      { status: 500 }
    );
  }
}
