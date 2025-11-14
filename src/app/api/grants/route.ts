import { NextRequest, NextResponse } from "next/server";
import { getGrants } from "@/app/api/common/grants/getGrants";

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const grants = await getGrants();

    // Transform to match frontend interface
    const transformedGrants = grants.map((grant) => ({
      id: grant.id,
      title: grant.title,
      description: grant.description,
      slug: grant.slug,
      active: grant.active,
      budgetRange: grant.budget_range || null,
      deadline: grant.deadline
        ? new Date(grant.deadline).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : null,
    }));

    return NextResponse.json(transformedGrants, { status: 200 });
  } catch (error) {
    console.error("Error fetching grants:", error);
    return NextResponse.json(
      { error: "Failed to fetch grants" },
      { status: 500 }
    );
  }
}
