import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiUser } from "@/app/lib/middleware/auth";
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
    return new Response(authResponse.reason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    const { roundId, impactMetricId } = route.params;
    try {
      const comments = fetchImpactMetricComments(roundId, impactMetricId);
      return new Response(JSON.stringify(comments), { status: 200 });
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
    return new Response(authResponse.reason, { status: 401 });
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
      return new Response(JSON.stringify(retrievedComment), { status: 200 });
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
