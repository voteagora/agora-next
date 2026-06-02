import { NextRequest, NextResponse } from "next/server";
import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { withApiRouteMonitoring } from "@/lib/apiMonitoring";

async function post(
  request: NextRequest,
  route: {
    params: Promise<{
      roundId: string;
      ballotCasterAddressOrEns: string;
      toggle: string;
    }>;
  }
) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { validateAddressScope } = await import("@/app/lib/auth/serverAuth");

  const { updateBallotOsOnly } = await import(
    "@/app/api/common/ballots/updateBallot"
  );

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const { roundId, ballotCasterAddressOrEns, toggle } = await route.params;
  const scopeError = await validateAddressScope(
    ballotCasterAddressOrEns,
    authResponse
  );
  if (scopeError) return scopeError;

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const ballot = await updateBallotOsOnly(
        toggle === "true" ? true : false,
        Number(roundId),
        ballotCasterAddressOrEns
      );
      return NextResponse.json(ballot);
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}

export const POST = withApiRouteMonitoring(
  "api.v1.retrofunding.ballots.os_only",
  post
);
