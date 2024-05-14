import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { deleteBallotMetric } from "@/app/api/common/ballots/updateBallot";

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
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    const { roundId, ballotCasterAddressOrEns, impactMetricId } = route.params;

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
