import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { traceWithUserId } from "../../../../v1/apiUtils";
import { createOptionalStringValidator } from "../../../../common/utils/validators";
import { getArchiveProposalVotes } from "../../archiveService";

const DEFAULT_SORT = "weight";
const DEFAULT_SORT_ORDER = "desc";

const sortValidator = createOptionalStringValidator(
  ["weight", "block_number"],
  DEFAULT_SORT
);
const sortOrderValidator = createOptionalStringValidator(
  ["asc", "desc"],
  DEFAULT_SORT_ORDER
);

export async function GET(
  request: NextRequest,
  route: { params: Promise<{ proposalId: string }> }
) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  return traceWithUserId(authResponse.userId as string, async () => {
    try {
      const params = request.nextUrl.searchParams;
      const sort = sortValidator.parse(params.get("sort"));
      const sortOrder = sortOrderValidator.parse(params.get("sortOrder"));
      const { proposalId } = await route.params;
      const votes = await getArchiveProposalVotes({
        proposalId,
        sort,
        sortOrder,
      });

      if (!votes) {
        return NextResponse.json(
          { error: "Proposal not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(votes);
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
