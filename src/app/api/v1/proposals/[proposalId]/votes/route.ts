import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { proposalId: string } }
) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { traceWithUserId } = await import("../../../apiUtils");
  const { fetchVotesForProposal } = await import(
    "../../../../common/votes/getVotes"
  );
  const { createOptionalNumberValidator, createOptionalStringValidator } =
    await import("@/app/api/common/utils/validators");

  const DEFAULT_SORT = "weight";
  const DEFAULT_MAX_LIMIT = 1000;
  const DEFAULT_LIMIT = 10;
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

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const { proposalId } = params;

  try {
    const sort = sortValidator.parse(searchParams.get("sort"));
    const limit = limitValidator.parse(searchParams.get("limit"));
    const offset = offsetValidator.parse(searchParams.get("offset"));
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
}
