import { updateBallotOsMultiplier } from "@/app/api/common/ballots/updateBallot";
import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { resolveENSName } from "@/app/lib/ENSUtils";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { isAddress } from "ethers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  route: {
    params: {
      roundId: string;
      ballotCasterAddressOrEns: string;
      multiplier: string;
    };
  }
) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const { roundId, ballotCasterAddressOrEns, multiplier } = route.params;

      const address = isAddress(ballotCasterAddressOrEns)
        ? ballotCasterAddressOrEns.toLowerCase()
        : await resolveENSName(ballotCasterAddressOrEns);

      if (authResponse.userId?.toLowerCase() !== address) {
        return new Response("Unauthorized to perform action on this address", {
          status: 401,
        });
      }

      const ballot = await updateBallotOsMultiplier(
        Number(multiplier),
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
