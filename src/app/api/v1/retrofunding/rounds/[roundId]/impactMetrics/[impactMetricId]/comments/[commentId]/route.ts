import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { fetchImpactMetricComment } from "@/app/api/common/comments/getImpactMetricComments";
import { updateImpactMetricComment } from "@/app/api/common/comments/updateImpactMetricComment";
import { deleteImpactMetricComment } from "@/app/api/common/comments/deleteImpactMetricComment";

export async function GET(
  request: NextRequest,
  route: {
    params: { roundId: string; impactMetricId: string; commentId: string };
  }
) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    const { commentId } = route.params;
    try {
      const comments = await fetchImpactMetricComment(Number(commentId));
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
  route: {
    params: { roundId: string; impactMetricId: string; commentId: string };
  }
) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  if (!authResponse.userId) {
    return new Response("Can't get user address from auth token", {
      status: 401,
    });
  }

  return await traceWithUserId(authResponse.userId, async () => {
    const { commentId, impactMetricId } = route.params;

    const body = await request.json();
    if (!body.comment) {
      return new Response("Missing comment in request body", { status: 400 });
    }

    try {
      const comments = await updateImpactMetricComment({
        commentId: Number(commentId),
        metricId: impactMetricId,
        address: authResponse.userId!,
        comment: body.comment,
      });
      return NextResponse.json(comments);
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}

export async function DELETE(
  request: NextRequest,
  route: {
    params: { roundId: string; impactMetricId: string; commentId: string };
  }
) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    const { commentId } = route.params;
    try {
      const comments = await deleteImpactMetricComment({
        commentId: Number(commentId),
      });
      return NextResponse.json(comments);
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
