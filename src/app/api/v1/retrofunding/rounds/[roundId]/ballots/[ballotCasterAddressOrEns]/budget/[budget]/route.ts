import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { traceWithUserId } from "@/app/api/v1/apiUtils";

const budgetParser = z.string(z.number().min(2000000).max(8000000)); // number between 2M and 8M

export async function POST(
  request: NextRequest,
  route: {
    params: {
      roundId: string;
      ballotCasterAddressOrEns: string;
      budget: string;
    };
  }
) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { validateAddressScope } = await import("@/app/lib/auth/serverAuth");

  const { updateBallotBudget } = await import(
    "@/app/api/common/ballots/updateBallot"
  );
  const { getCategoryScope } = await import("@/app/lib/auth/serverAuth");

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const { roundId, ballotCasterAddressOrEns } = route.params;
  const scopeError = await validateAddressScope(
    ballotCasterAddressOrEns,
    authResponse
  );
  if (scopeError) return scopeError;

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const categoryScope = getCategoryScope(authResponse);

      if (!categoryScope) {
        return new Response(
          "This user does not have a category scope. Regenerate the JWT token",
          {
            status: 401,
          }
        );
      }

      const ballot = await updateBallotBudget(
        Number(budgetParser.parse(route.params.budget)),
        Number(roundId),
        categoryScope,
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
