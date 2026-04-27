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
    const metrics = await db.daoFinancialMetrics.findMany({
      where: {
        dao_slug: daoSlug,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 2,
      select: {
        id: true,
        dao_slug: true,
        data: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error("Error fetching financial metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch financial metrics" },
      { status: 500 }
    );
  }
}
