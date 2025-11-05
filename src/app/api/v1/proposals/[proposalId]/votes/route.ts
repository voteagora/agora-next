import { NextRequest, NextResponse } from "next/server";
import { traceWithUserId } from "../../../apiUtils";
import {
  createOptionalNumberValidator,
  createOptionalStringValidator,
} from "@/app/api/common/utils/validators";

const DEFAULT_SORT = "weight";
const DEFAULT_MAX_LIMIT = 1000;
const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;

const sortValidator = createOptionalStringValidator(
  ["weight", "block_number"],
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
  route: { params: Promise<{ proposalId: string }> }
) {
  const { proposalId } = await route.params;
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");

  const { fetchVotesForProposal } = await import(
    "../../../../common/votes/getVotes"
  );

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    const params = request.nextUrl.searchParams;
    try {
      const sort = sortValidator.parse(params.get("sort"));
      const limit = limitValidator.parse(params.get("limit"));
      const offset = offsetValidator.parse(params.get("offset"));
      const votes = await fetchVotesForProposal({
        proposalId,
        pagination: { limit, offset },
        sort,
      });
      return NextResponse.json(votes);
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
