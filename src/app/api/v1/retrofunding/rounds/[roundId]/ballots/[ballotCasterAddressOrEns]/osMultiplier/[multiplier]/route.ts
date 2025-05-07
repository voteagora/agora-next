import { NextRequest, NextResponse } from "next/server";
import { traceWithUserId } from "@/app/api/v1/apiUtils";


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
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { validateAddressScope } = await import("@/app/lib/auth/serverAuth");
  
  const { updateBallotOsMultiplier } = await import(
    "@/app/api/common/ballots/updateBallot"
  );
  const { createOptionalFloatNumberValidator } = await import(
    "@/app/api/common/utils/validators"
  );

  const authResponse = await authenticateApiUser(request);

  const multiplierValidator = createOptionalFloatNumberValidator(1, 5, 1);

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
