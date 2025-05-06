import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { roundId: string; impactMetricId: string } }
) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { default: Tenant } = await import("@/lib/tenant/tenant");
  const { prismaWeb2Client } = await import("@/app/lib/prisma");
  const { traceWithUserId } = await import("@/app/api/v1/apiUtils");

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return NextResponse.json(
      { error: authResponse.failReason },
      { status: 401 }
    );
  }

  const { namespace } = Tenant.current();

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const { roundId, impactMetricId } = params;

      const comments = await prismaWeb2Client.metrics_comments.findMany({
        where: {
          metric_id: impactMetricId,
        },
        orderBy: {
          created_at: "desc",
        },
      });

      return NextResponse.json(comments);
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
  { params }: { params: { roundId: string; impactMetricId: string } }
) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { default: Tenant } = await import("@/lib/tenant/tenant");
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

  const { namespace } = Tenant.current();

  return await traceWithUserId(authResponse.userId, async () => {
    try {
      const { roundId, impactMetricId } = params;
      const { comment } = await request.json();

      const CommentSchema = z.object({
        comment: z.string().min(1),
      });

      const validatedData = CommentSchema.parse({ comment });

      const newComment = await prismaWeb2Client.metrics_comments.create({
        data: {
          metric_id: impactMetricId,
          address: authResponse.userId,
          content: validatedData.comment,
        },
      });

      return NextResponse.json(newComment);
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
