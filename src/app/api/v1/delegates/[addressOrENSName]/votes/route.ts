import { NextRequest, NextResponse } from "next/server";
import { traceWithUserId } from "../../../apiUtils";

export async function GET(
  request: NextRequest,
  route: { params: Promise<{ addressOrENSName: string }> }
) {
  const { addressOrENSName } = await route.params;
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");

  const { fetchVotesForDelegate } = await import(
    "../../../../common/votes/getVotes"
  );
  const { createOptionalNumberValidator } = await import(
    "../../../../common/utils/validators"
  );

  const DEFAULT_MAX_LIMIT = 50;
  const DEFAULT_LIMIT = 20;
  const DEFAULT_OFFSET = 0;

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

  return await traceWithUserId(authResponse.userId as string, async () => {
    const params = request.nextUrl.searchParams;
    try {
      const limit = limitValidator.parse(params.get("limit"));
      const offset = offsetValidator.parse(params.get("offset"));
      const proposal = await fetchVotesForDelegate({
        addressOrENSName,
        pagination: { limit, offset },
      });
      return NextResponse.json(proposal);
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
