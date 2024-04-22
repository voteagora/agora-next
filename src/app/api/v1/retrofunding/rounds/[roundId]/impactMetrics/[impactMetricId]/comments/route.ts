import { NextResponse, type NextRequest } from "next/server";
import {
  fetchImpactMetricComments,
  fetchImpactMetricComment,
} from "@/app/api/common/comments/getImpactMetricComments";

export async function GET(
  request: NextRequest,
  route: { params: { roundId: string; impactMetricId: string } }
) {
  const { roundId, impactMetricId } = route.params;
  const comments = fetchImpactMetricComments(roundId, impactMetricId);
  return new Response(JSON.stringify(comments), { status: 200 });
}

export async function PUT(
  request: NextRequest,
  route: { params: { roundId: string; impactMetricId: string } }
) {
  const { roundId, impactMetricId } = route.params;
  const body = await request.json();
  const { comment } = body;
  const retrievedComment = fetchImpactMetricComment(
    roundId,
    impactMetricId,
    comment.id
  );
  return new Response(JSON.stringify(retrievedComment), { status: 200 });
}
