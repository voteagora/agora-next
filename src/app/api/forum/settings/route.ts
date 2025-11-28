import { NextRequest, NextResponse } from "next/server";
import { prismaWeb2Client } from "@/app/lib/web2";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daoSlug = searchParams.get("daoSlug");

    if (!daoSlug) {
      return NextResponse.json(
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
    >`
      SELECT min_vp_for_topics, min_vp_for_replies, min_vp_for_actions, min_vp_for_proposals
      FROM alltenant.dao_forum_settings 
      WHERE dao_slug = ${daoSlug}
    `;

    if (result.length === 0) {
      // Return defaults if no settings found
      return NextResponse.json({
        minVpForTopics: 1,
        minVpForReplies: 1,
        minVpForActions: 1,
        minVpForProposals: 1,
      });
    }

    return NextResponse.json({
      minVpForTopics: result[0].min_vp_for_topics,
      minVpForReplies: result[0].min_vp_for_replies,
      minVpForActions: result[0].min_vp_for_actions,
      minVpForProposals: result[0].min_vp_for_proposals,
    });
  } catch (error) {
    console.error("Failed to fetch forum settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch forum settings" },
      { status: 500 }
    );
  }
}
