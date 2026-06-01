import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { traceWithUserId } from "../../v1/apiUtils";
import { createOptionalStringValidator } from "../../common/utils/validators";
import { getArchiveProposals } from "./archiveService";

const DEFAULT_FILTER = "relevant";

const filterValidator = createOptionalStringValidator(
  ["relevant", "everything", "temp-checks"],
  DEFAULT_FILTER
);

export async function GET(request: NextRequest) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  return traceWithUserId(authResponse.userId as string, async () => {
    try {
      const params = request.nextUrl.searchParams;
      const filter = filterValidator.parse(params.get("filter"));
      const proposals = await getArchiveProposals({
        filter,
      });

      return NextResponse.json(proposals);
    } catch (error) {
      if (error instanceof ZodError) {
        return new Response("Invalid query parameters: " + error.toString(), {
          status: 400,
        });
      }

      return new Response("Internal server error: " + String(error), {
        status: 500,
      });
    }
  });
}
