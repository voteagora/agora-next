import { NextResponse, type NextRequest } from "next/server";
import {
  authenticateApiUser,
  validateAddressScope,
} from "@/app/lib/auth/serverAuth";
import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { updateBallotProjectPosition } from "@/app/api/common/ballots/updateBallotProject";
import { z } from "zod";

const impactParser = z.number().int().gte(0); // positive integer

export async function POST(
  request: NextRequest,
  route: {
    params: {
      roundId: string;
      ballotCasterAddressOrEns: string;
      projectId: string;
      position: number;
    };
  }
) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const { roundId, ballotCasterAddressOrEns, projectId, position } =
    route.params;
  const scopeError = await validateAddressScope(
    ballotCasterAddressOrEns,
    authResponse
  );
  if (scopeError) return scopeError;

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const ballot = await updateBallotProjectPosition(
        impactParser.parse(Number(position)),
        projectId,
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
