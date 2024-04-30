import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { traceWithUserId } from "@/app/api/v1/apiUtils";

import {
  fetchImpactMetricComments,
  fetchImpactMetricComment,
} from "@/app/api/common/comments/getImpactMetricComments";

export async function GET(
  request: NextRequest,
  route: { params: { roundId: string; impactMetricId: string } }
) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    const { roundId, impactMetricId } = route.params;
    try {
      const comments = fetchImpactMetricComments(roundId, impactMetricId);
      return NextResponse.json(comments);
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}

export async function PUT(
  request: NextRequest,
  route: { params: { roundId: string; impactMetricId: string } }
) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    const { roundId, impactMetricId } = route.params;
    try {
      const body = await request.json();
      const { comment } = body;
      const retrievedComment = fetchImpactMetricComment(
        roundId,
        impactMetricId,
        comment.id
      );
      return NextResponse.json(retrievedComment);
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
