import { NextResponse, type NextRequest } from "next/server";
import { z, ZodError } from "zod";
import { traceWithUserId } from "../../apiUtils";
import { createOptionalStringValidator } from "@/app/api/common/utils/validators";

const statusValidator = z
  .union([
    z.literal(null),
    z.literal(""),
    z.enum(["pending_review", "qualified"]),
  ])
  .transform((x) => (x !== null && x !== "" ? x : undefined));

const sortValidator = createOptionalStringValidator(
  ["submitted_at", "updated_at"],
  "submitted_at"
);

const orderValidator = createOptionalStringValidator(["asc", "desc"], "desc");

const createSubmissionSchema = z.object({
  title: z.string().min(1).max(200),
  content_markdown: z.string().min(1),
  author_email: z.string().email(),
  author_display_name: z.string().optional().nullable(),
  author_github: z.string().optional().nullable(),
  is_anonymous: z.boolean().default(false),
  attachments: z
    .array(
      z.object({
        file: z.string(),
        filename: z.string(),
        mime_type: z.string(),
        label: z.string().optional().default(""),
      })
    )
    .optional()
    .default([]),
});

export async function GET(request: NextRequest) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { fetchSubmissions } = await import(
    "@/app/api/common/contest/getSubmissions"
  );

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    const params = request.nextUrl.searchParams;

    try {
      const status = statusValidator.parse(params.get("status"));
      const sort = sortValidator.parse(params.get("sort")) as
        | "submitted_at"
        | "updated_at";
      const order = orderValidator.parse(params.get("order")) as "asc" | "desc";

      const submissions = await fetchSubmissions({
        status: status || undefined,
        sort,
        order,
      });

      return NextResponse.json({
        submissions,
        meta: {
          total: submissions.length,
        },
      });
    } catch (e: any) {
      if (e instanceof ZodError) {
        return new Response("Invalid query parameters: " + e.toString(), {
          status: 400,
        });
      }

      console.error("Error fetching submissions:", e);
      return new Response("Internal server error", { status: 500 });
    }
  });
}

export async function POST(request: NextRequest) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { createSubmission, createForumTopicFromSubmission } = await import(
    "@/app/api/common/contest/submissionActions"
  );
  const { checkWalletHasSubmission } = await import(
    "@/app/api/common/contest/getSubmissions"
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

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const body = await request.json();
      const validated = createSubmissionSchema.parse(body);
      const ipAddress =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown";

      const hasExisting = await checkWalletHasSubmission(walletAddress);
      if (hasExisting) {
        return new Response(
          JSON.stringify({
            error: "You have already submitted an entry to this contest",
            code: "DUPLICATE_SUBMISSION",
          }),
          {
            status: 409,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const submission = await createSubmission(walletAddress, {
        title: validated.title,
        contentMarkdown: validated.content_markdown,
        authorEmail: validated.author_email,
        ipAddress,
        authorDisplayName: validated.author_display_name || undefined,
        authorGithub: validated.author_github || undefined,
        isAnonymous: validated.is_anonymous,
        attachments: validated.attachments.map((att) => ({
          file: att.file,
          filename: att.filename,
          mime_type: att.mime_type,
          label: att.label,
        })),
      });

      createForumTopicFromSubmission({
        id: submission.id,
        title: submission.title,
        contentMarkdown: submission.contentMarkdown,
        authorWallet: submission.authorWallet,
      }).catch((err) => {
        console.error("Background forum topic creation failed:", err);
      });

      return NextResponse.json(
        {
          id: submission.id,
          title: submission.title,
          status: submission.status,
          submittedAt: submission.submittedAt,
          message: "Submission created successfully",
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

      if (e.message?.includes("already submitted")) {
        return new Response(
          JSON.stringify({
            error: e.message,
            code: "DUPLICATE_SUBMISSION",
          }),
          {
            status: 409,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      console.error("Error creating submission:", e);
      return new Response(
        JSON.stringify({ error: "Failed to create submission" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  });
}
