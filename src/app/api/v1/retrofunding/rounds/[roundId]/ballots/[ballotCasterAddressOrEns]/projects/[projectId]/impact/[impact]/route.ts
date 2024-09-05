import { NextResponse, type NextRequest } from "next/server";
import {
  authenticateApiUser,
  getCategoryScope,
  validateAddressScope,
  validateProjectCategoryScope,
} from "@/app/lib/auth/serverAuth";
import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { updateBallotProjectImpact } from "@/app/api/common/ballots/updateBallotProject";
import { z } from "zod";

const impactParser = z.number().int().gte(0).lte(5); // integer between 0 and 5

export async function POST(
  request: NextRequest,
  route: {
    params: {
      roundId: string;
      ballotCasterAddressOrEns: string;
      projectId: string;
      impact: number;
    };
  }
) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const { roundId, ballotCasterAddressOrEns, projectId, impact } = route.params;
  const scopeError = await validateAddressScope(
    ballotCasterAddressOrEns,
    authResponse
  );
  if (scopeError) return scopeError;

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      // Check project category & reject update if address scope is not correct
      const projectScopeError = await validateProjectCategoryScope(
        projectId,
        roundId,
        authResponse
      );
      if (projectScopeError) return projectScopeError;

      const categoryScope = getCategoryScope(authResponse);

      const ballot = await updateBallotProjectImpact(
        impactParser.parse(Number(impact)),
        projectId,
        Number(roundId),
        categoryScope!,
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
