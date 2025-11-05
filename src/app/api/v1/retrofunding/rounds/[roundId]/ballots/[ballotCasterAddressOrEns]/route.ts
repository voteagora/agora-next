import { NextResponse, NextRequest } from "next/server";
import { traceWithUserId } from "@/app/api/v1/apiUtils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roundId: string; ballotCasterAddressOrEns: string }> }
) {
  const { roundId, ballotCasterAddressOrEns } = await params;
  const { authenticateApiUser, getCategoryScope, validateAddressScope } =
    await import("@/app/lib/auth/serverAuth");
  const { fetchBallot } = await import("@/app/api/common/ballots/getBallots");

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }
  const scopeError = await validateAddressScope(
    ballotCasterAddressOrEns,
    authResponse
  );
  if (scopeError) return scopeError;

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const categoryScope = getCategoryScope(authResponse);

      if (!categoryScope) {
        return new Response(
          "This user does not have a category scope. Regenerate the JWT token",
          {
            status: 401,
          }
        );
      }

      const ballots = await fetchBallot(
        Number(roundId),
        ballotCasterAddressOrEns,
        categoryScope
      );
      return NextResponse.json(ballots);
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
