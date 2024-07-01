import { fetchImpactMetricCommentVotes } from "@/app/api/common/comments/getImpactMetricCommentVotes";
import { updateImpactMetricCommentVote } from "@/app/api/common/comments/updateImpactMetricCommentVote";
import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { NextRequest, NextResponse } from "next/server";
import { createOptionalNumberValidator } from "@/app/api/common/utils/validators";

const voteValidator = createOptionalNumberValidator(-1, 1, 0);

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
    const { roundId, impactMetricId, commentId } = route.params;
    try {
      const comments = await fetchImpactMetricCommentVotes({
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

  if (!authResponse.scope?.includes("badgeholder")) {
    return new Response("Only badgeholder can vote on a comment", {
      status: 401,
    });
  }

  return await traceWithUserId(authResponse.userId, async () => {
    const { commentId } = route.params;

    const body = await request.json();
    if (body.vote == undefined) {
      return new Response("Missing vote in request body", { status: 400 });
    }

    try {
      const vote = voteValidator.parse(body.vote);

      const comments = await updateImpactMetricCommentVote({
        commentId: Number(commentId),
        vote,
        address: authResponse.userId as string,
      });
      return NextResponse.json(comments);
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
