import { NextResponse, type NextRequest } from "next/server";
import { z, ZodError } from "zod";
import { traceWithUserId } from "../../../../apiUtils";

const updateStatusSchema = z.object({
  status: z.enum(["qualified", "disqualified"]),
  disqualification_reason: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { fetchSubmissionById } = await import(
    "@/app/api/common/contest/getSubmissions"
  );
  const { updateSubmissionStatus } = await import(
    "@/app/api/common/contest/submissionActions"
  );
  const { createGithubPR } = await import(
    "@/app/api/common/contest/githubService"
  );

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const isAdmin =
    authResponse.scope?.includes("admin") ||
    authResponse.scope?.includes("super_admin") ||
    authResponse.scope?.includes("duna_admin");

  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "Admin access required" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { id } = await params;

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const body = await request.json();
      const validated = updateStatusSchema.parse(body);

      if (
        validated.status === "disqualified" &&
        !validated.disqualification_reason
      ) {
        return new Response(
          JSON.stringify({
            error: "Disqualification reason is required",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const existingSubmission = await fetchSubmissionById(id);
      if (!existingSubmission) {
        return new Response(JSON.stringify({ error: "Submission not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      const updatedSubmission = await updateSubmissionStatus(
        id,
        validated.status,
        validated.disqualification_reason
      );

      const shouldCreateGithubPr =
        validated.status === "qualified" &&
        existingSubmission.status !== "qualified" &&
        !updatedSubmission.githubPrUrl;

      let githubPrUrl = updatedSubmission.githubPrUrl;
      let githubPrNumber = updatedSubmission.githubPrNumber;

      if (shouldCreateGithubPr) {
        const prResult = await createGithubPR(updatedSubmission);
        if (!prResult) {
          return new Response(
            JSON.stringify({
              error:
                "Submission status was updated, but GitHub PR creation failed",
              code: "GITHUB_PR_CREATE_FAILED",
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        githubPrUrl = prResult.prUrl;
        githubPrNumber = prResult.prNumber;
      }

      return NextResponse.json({
        id: updatedSubmission.id,
        status: updatedSubmission.status,
        disqualificationReason: updatedSubmission.disqualificationReason,
        githubPrUrl,
        githubPrNumber,
        message: `Submission ${validated.status}`,
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

      console.error("Error updating submission status:", e);
      return new Response(
        JSON.stringify({ error: "Failed to update submission status" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  });
}
