import { updateBallotOsMultiplier } from "@/app/api/common/ballots/updateBallot";
import { createOptionalFloatNumberValidator } from "@/app/api/common/utils/validators";
import { traceWithUserId } from "@/app/api/v1/apiUtils";
import {
  authenticateApiUser,
  validateAddressScope,
} from "@/app/lib/auth/serverAuth";
import { NextRequest, NextResponse } from "next/server";

const multiplierValidator = createOptionalFloatNumberValidator(1, 5, 1);

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

  const { roundId, ballotCasterAddressOrEns, multiplier } = route.params;
  const scopeError = await validateAddressScope(
    ballotCasterAddressOrEns,
    authResponse
  );
  if (scopeError) return scopeError;

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const multiplierPayload = multiplierValidator.parse(Number(multiplier));

      const ballot = await updateBallotOsMultiplier(
        multiplierPayload,
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
