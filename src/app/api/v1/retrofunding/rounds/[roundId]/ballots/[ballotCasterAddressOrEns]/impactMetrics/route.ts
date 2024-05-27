import { NextResponse, type NextRequest } from "next/server";
import {
  authenticateApiUser,
  validateAddressScope,
} from "@/app/lib/auth/serverAuth";
import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { updateBallotMetric } from "@/app/api/common/ballots/updateBallot";

export async function POST(
  request: NextRequest,
  route: { params: { roundId: string; ballotCasterAddressOrEns: string } }
) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const { roundId, ballotCasterAddressOrEns } = route.params;
  await validateAddressScope(ballotCasterAddressOrEns, authResponse);

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const payload = await request.json();

      // TODO: Validate payload

      const impactMetrics = await updateBallotMetric(
        payload,
        Number(roundId),
        ballotCasterAddressOrEns
      );
      return NextResponse.json(impactMetrics);
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
