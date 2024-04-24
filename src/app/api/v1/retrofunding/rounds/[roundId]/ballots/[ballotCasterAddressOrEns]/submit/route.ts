import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiUser } from "@/app/lib/middleware/auth";
import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { fetchBallot } from "@/app/api/common/ballots/getBallots";

export async function POST(
  request: NextRequest,
  route: { params: { roundId: string; ballotCasterAddressOrEns: string } }
) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.reason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    const { roundId, ballotCasterAddressOrEns } = route.params;
    try {
      const ballot = await fetchBallot(roundId, ballotCasterAddressOrEns);
      return NextResponse.json(ballot);
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
