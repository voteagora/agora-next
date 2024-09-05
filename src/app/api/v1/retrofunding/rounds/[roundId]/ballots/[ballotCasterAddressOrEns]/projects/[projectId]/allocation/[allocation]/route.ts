import { NextResponse, type NextRequest } from "next/server";
import {
  authenticateApiUser,
  validateAddressScope,
  validateProjectCategoryScope,
} from "@/app/lib/auth/serverAuth";
import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { updateBallotProjectAllocation } from "@/app/api/common/ballots/updateBallotProject";
import { fetchProjectApi } from "@/app/api/common/projects/getProjects";

export async function POST(
  request: NextRequest,
  route: {
    params: {
      roundId: string;
      ballotCasterAddressOrEns: string;
      projectId: string;
      allocation: string;
    };
  }
) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const { roundId, ballotCasterAddressOrEns, projectId, allocation } =
    route.params;
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

      const ballot = await updateBallotProjectAllocation(
        allocation,
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
