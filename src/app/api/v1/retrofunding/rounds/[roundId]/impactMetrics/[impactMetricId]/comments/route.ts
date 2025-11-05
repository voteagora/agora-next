import { NextResponse, type NextRequest } from "next/server";
import { traceWithUserId } from "@/app/api/v1/apiUtils";

import {
  createOptionalNumberValidator,
  createOptionalStringValidator,
} from "@/app/api/common/utils/validators";

const DEFAULT_SORT = "newest";
const DEFAULT_MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;

const sortValidator = createOptionalStringValidator(
  ["newest", "votes"],
  DEFAULT_SORT
);
const limitValidator = createOptionalNumberValidator(
  1,
  DEFAULT_MAX_LIMIT,
  DEFAULT_LIMIT
);
const offsetValidator = createOptionalNumberValidator(
  0,
  Number.MAX_SAFE_INTEGER,
  DEFAULT_OFFSET
);

export async function GET(
  request: NextRequest,
  route: { params: Promise<{ roundId: string; impactMetricId: string }> }
) {
  const { roundId, impactMetricId } = await route.params;
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");

  const { fetchImpactMetricComments } = await import(
    "@/app/api/common/comments/getImpactMetricComments"
  );

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {

    const searchParams = request.nextUrl.searchParams;
    try {
      const sort = sortValidator.parse(searchParams.get("sort"));
      const limit = limitValidator.parse(searchParams.get("limit"));
      const offest = offsetValidator.parse(searchParams.get("offset"));

      const comments = await fetchImpactMetricComments({
        roundId,
        impactMetricId,
        sort,
        limit,
        offset: offest,
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
  route: { params: { roundId: string; impactMetricId: string } }
) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");

  const { createImpactMetricComment } = await import(
    "@/app/api/common/comments/createImpactMetricComment"
  );

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
    const { roundId, impactMetricId } = route.params;

    const body = await request.json();
    if (!body.comment) {
      return new Response("Missing comment in request body", { status: 400 });
    }

    try {
      const retrievedComment = await createImpactMetricComment({
        metricId: impactMetricId,
        address: authResponse.userId!,
        comment: body.comment,
      });
      return NextResponse.json(retrievedComment);
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
