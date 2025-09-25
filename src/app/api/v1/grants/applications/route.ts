import { NextRequest, NextResponse } from "next/server";
import { prismaWeb2Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    // Simple auth check - in production, use proper admin auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { slug } = Tenant.current();
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status"); // submitted, accepted, rejected
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build WHERE clause
    let whereClause = `WHERE g.dao_slug = $1`;
    const params: any[] = [slug];
    let paramIndex = 2;

    if (status) {
      whereClause += ` AND ga.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    const query = `
      SELECT 
        ga.id,
        ga.grant_id,
        ga.applicant_address,
        ga.email,
        ga.telegram_handle,
        ga.organization,
        ga.data,
        ga.status,
        ga.created_at,
        g.slug as grant_slug,
        g.title as grant_title
      FROM alltenant.grant_applications ga
      JOIN alltenant.grants g ON ga.grant_id = g.id
      ${whereClause}
      ORDER BY ga.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const applications = await prismaWeb2Client.$queryRawUnsafe(
      query,
      ...params
    );

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM alltenant.grant_applications ga
      JOIN alltenant.grants g ON ga.grant_id = g.id
      ${whereClause}
    `;

    const countResult = await prismaWeb2Client.$queryRawUnsafe<
      Array<{ total: bigint }>
    >(
      countQuery,
      ...params.slice(0, -2) // Remove limit/offset params
    );

    const total = Number(countResult[0].total);

    return NextResponse.json({
      applications,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching grant applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
