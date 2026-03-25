import { NextResponse, type NextRequest } from "next/server";
import { z, ZodError } from "zod";
import { traceWithUserId } from "../../../../apiUtils";

const createCommentSchema = z.object({
  content: z.string().min(1).max(10000),
  author_display_name: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { getSubmissionComments } = await import(
    "@/app/api/common/contest/submissionActions"
  );

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const { id } = await params;

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const comments = await getSubmissionComments(id);

      return NextResponse.json({
        comments,
        meta: {
          total: comments.length,
        },
      });
    } catch (e: any) {
      console.error("Error fetching comments:", e);
      return new Response("Internal server error", { status: 500 });
    }
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { createSubmissionComment } = await import(
    "@/app/api/common/contest/submissionActions"
  );

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const walletAddress = authResponse.userId;
  if (!walletAddress || !walletAddress.startsWith("0x")) {
    return new Response(
      "Wallet authentication required. Please sign in with your wallet.",
      { status: 401 }
    );
  }

  const { id } = await params;

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const body = await request.json();
      const validated = createCommentSchema.parse(body);

      const comment = await createSubmissionComment(
        id,
        walletAddress,
        validated.author_display_name || null,
        validated.content
      );

      return NextResponse.json(
        {
          id: comment.id,
          content: comment.content,
          authorWallet: comment.authorWallet,
          authorDisplayName: comment.authorDisplayName,
          createdAt: comment.createdAt,
          message: "Comment created successfully",
        },
        { status: 201 }
      );
    } catch (e: any) {
      if (e instanceof ZodError) {
        return new Response(
          JSON.stringify({
            error: "Invalid request body",
            details: e.errors,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (e.message?.includes("not found")) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      console.error("Error creating comment:", e);
      return new Response(
        JSON.stringify({ error: "Failed to create comment" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  });
}
