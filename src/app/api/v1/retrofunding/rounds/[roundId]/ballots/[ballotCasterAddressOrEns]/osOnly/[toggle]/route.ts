import { updateBallotOsOnly } from "@/app/api/common/ballots/updateBallot";
import { traceWithUserId } from "@/app/api/v1/apiUtils";
import {
  authenticateApiUser,
  validateAddressScope,
} from "@/app/lib/auth/serverAuth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  route: {
    params: {
      roundId: string;
      ballotCasterAddressOrEns: string;
      toggle: string;
    };
  }
) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const { roundId, ballotCasterAddressOrEns, toggle } = route.params;
  await validateAddressScope(ballotCasterAddressOrEns, authResponse);

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
