import { NextResponse, type NextRequest } from "next/server";

export async function DELETE(
  request: NextRequest,
  route: {
    params: {
      roundId: string;
      ballotCasterAddressOrEns: string;
      impactMetricId: string;
    };
  }
) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { validateAddressScope } = await import("@/app/lib/auth/serverAuth");
  const { traceWithUserId } = await import("@/app/api/v1/apiUtils");
  const { deleteBallotMetric } = await import(
    "@/app/api/common/ballots/updateBallot"
  );

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const { roundId, ballotCasterAddressOrEns, impactMetricId } = route.params;
  const scopeError = await validateAddressScope(
    ballotCasterAddressOrEns,
    authResponse
  );
  if (scopeError) return scopeError;

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      await deleteBallotMetric(
        impactMetricId,
        Number(roundId),
        ballotCasterAddressOrEns
      );
      return NextResponse.json({ success: true });
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
