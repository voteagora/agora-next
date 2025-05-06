import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  {
    params,
  }: { params: { roundId: string; impactMetricId: string; commentId: string } }
) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { prismaWeb2Client } = await import("@/app/lib/prisma");
  const { traceWithUserId } = await import("@/app/api/v1/apiUtils");

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return NextResponse.json(
      { error: authResponse.failReason },
      { status: 401 }
    );
  }

  if (!authResponse.userId) {
    return NextResponse.json(
      { error: "User ID not found in auth response" },
      { status: 401 }
    );
  }

  const userId = authResponse.userId;

  return await traceWithUserId(userId, async () => {
    try {
      const { roundId, impactMetricId, commentId } = params;

      const votes = await prismaWeb2Client.metrics_comments_votes.findMany({
        where: {
          comment_id: parseInt(commentId, 10),
        },
        orderBy: {
          created_at: "desc",
        },
      });

      return NextResponse.json(votes);
    } catch (e: any) {
      return NextResponse.json(
        { error: "Internal server error: " + e.toString() },
        { status: 500 }
      );
    }
  });
}

export async function POST(
  request: NextRequest,
  {
    params,
  }: { params: { roundId: string; impactMetricId: string; commentId: string } }
) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { prismaWeb2Client } = await import("@/app/lib/prisma");
  const { traceWithUserId } = await import("@/app/api/v1/apiUtils");
  const { z } = await import("zod");

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return NextResponse.json(
      { error: authResponse.failReason },
      { status: 401 }
    );
  }

  if (!authResponse.userId) {
    return NextResponse.json(
      { error: "User ID not found in auth response" },
      { status: 401 }
    );
  }

  const userId = authResponse.userId;

  return await traceWithUserId(userId, async () => {
    try {
      const { roundId, impactMetricId, commentId } = params;
      const { vote } = await request.json();

      const VoteSchema = z.object({
        vote: z.number().int().min(-1).max(1),
      });

      const validatedData = VoteSchema.parse({ vote });

      const newVote = await prismaWeb2Client.metrics_comments_votes.create({
        data: {
          comment_id: parseInt(commentId, 10),
          voter: userId,
          vote: validatedData.vote,
        },
      });

      return NextResponse.json(newVote);
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        return NextResponse.json({ error: e.toString() }, { status: 400 });
      }
      return NextResponse.json(
        { error: "Internal server error: " + e.toString() },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: { params: { roundId: string; impactMetricId: string; commentId: string } }
) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { prismaWeb2Client } = await import("@/app/lib/prisma");
  const { traceWithUserId } = await import("@/app/api/v1/apiUtils");

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return NextResponse.json(
      { error: authResponse.failReason },
      { status: 401 }
    );
  }

  if (!authResponse.userId) {
    return NextResponse.json(
      { error: "User ID not found in auth response" },
      { status: 401 }
    );
  }

  const userId = authResponse.userId;

  return await traceWithUserId(userId, async () => {
    try {
      const { roundId, impactMetricId, commentId } = params;

      await prismaWeb2Client.metrics_comments_votes.delete({
        where: {
          comment_id_voter: {
            comment_id: parseInt(commentId, 10),
            voter: userId,
          },
        },
      });

      return NextResponse.json({ success: true });
    } catch (e: any) {
      return NextResponse.json(
        { error: "Internal server error: " + e.toString() },
        { status: 500 }
      );
    }
  });
}
