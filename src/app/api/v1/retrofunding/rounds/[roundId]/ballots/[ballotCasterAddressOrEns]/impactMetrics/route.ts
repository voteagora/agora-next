import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { updateBallotMetric } from "@/app/api/common/ballots/updateBallot";
import { isAddress } from "ethers";
import { resolveENSName } from "@/app/lib/ENSUtils";

export async function POST(
  request: NextRequest,
  route: { params: { roundId: string; ballotCasterAddressOrEns: string } }
) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const { roundId, ballotCasterAddressOrEns } = route.params;

      const address = isAddress(ballotCasterAddressOrEns)
        ? ballotCasterAddressOrEns.toLowerCase()
        : await resolveENSName(ballotCasterAddressOrEns);

      if (authResponse.userId?.toLowerCase() !== address) {
        return new Response("Unauthorized to perform action on this address", {
          status: 401,
        });
      }

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
