import { NextRequest, NextResponse } from "next/server";
import { getGrant } from "@/app/api/common/grants/getGrant";

export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: { grantSlug: string } }
) {
  try {
    const grant = await getGrant(params.grantSlug);

    if (!grant) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    }

    // Transform to match frontend interface
    const transformedGrant = {
      id: grant.id,
      title: grant.title,
      description: grant.description,
      slug: grant.slug,
      active: grant.active,
      budgetRange: grant.budget_range || "TBD",
      deadline: grant.deadline
        ? new Date(grant.deadline).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "No deadline",
      form_schema: grant.form_schema || [],
      bottom_text_config: grant.bottom_text_config || null,
      bottom_text: grant.bottom_text || null,
      category: grant.category || null,
    };

    return NextResponse.json(transformedGrant, { status: 200 });
  } catch (error) {
    console.error("Error fetching grant:", error);
    return NextResponse.json(
      { error: "Failed to fetch grant" },
      { status: 500 }
    );
  }
}
