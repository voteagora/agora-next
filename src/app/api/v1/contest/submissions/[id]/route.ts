import { NextResponse, type NextRequest } from "next/server";
import { z, ZodError } from "zod";
import { traceWithUserId } from "../../../apiUtils";

const updateSubmissionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content_markdown: z.string().min(1).optional(),
  attachments: z
    .array(
      z.object({
        file: z.string(),
        filename: z.string(),
        mime_type: z.string(),
        label: z.string().optional().default(""),
      })
    )
    .optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { fetchSubmissionById } = await import(
    "@/app/api/common/contest/getSubmissions"
  );

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const { id } = await params;

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const submission = await fetchSubmissionById(id);

      if (!submission) {
        return new Response(JSON.stringify({ error: "Submission not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return NextResponse.json(submission);
    } catch (e: any) {
      console.error("Error fetching submission:", e);
      return new Response("Internal server error", { status: 500 });
    }
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { updateSubmission } = await import(
    "@/app/api/common/contest/submissionActions"
  );
  const { updateGithubPR } = await import(
    "@/app/api/common/contest/githubService"
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
      const validated = updateSubmissionSchema.parse(body);

      const updatedSubmission = await updateSubmission(id, walletAddress, {
        title: validated.title,
        contentMarkdown: validated.content_markdown,
        attachments: validated.attachments?.map((att) => ({
          file: att.file,
          filename: att.filename,
          mime_type: att.mime_type,
          label: att.label,
        })),
      });

      updateGithubPR(updatedSubmission).catch((err) => {
        console.error("Background GitHub PR update failed:", err);
      });

      return NextResponse.json({
        id: updatedSubmission.id,
        title: updatedSubmission.title,
        status: updatedSubmission.status,
        updatedAt: updatedSubmission.updatedAt,
        message: "Submission updated successfully",
      });
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

      if (e.message?.includes("not authorized")) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      console.error("Error updating submission:", e);
      return new Response(
        JSON.stringify({ error: "Failed to update submission" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { deleteSubmission } = await import(
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

  const isAdmin =
    authResponse.scope?.includes("admin") ||
    authResponse.scope?.includes("super_admin") ||
    authResponse.scope?.includes("duna_admin");

  const { id } = await params;

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const deleted = await deleteSubmission(id, walletAddress, !!isAdmin);
      return NextResponse.json({
        id: deleted.id,
        message: "Submission deleted successfully",
      });
    } catch (e: any) {
      if (e.message?.includes("not found")) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (e.message?.includes("not authorized")) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      console.error("Error deleting submission:", e);
      return new Response(
        JSON.stringify({ error: "Failed to delete submission" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  });
}
