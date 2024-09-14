import { NextResponse, type NextRequest } from "next/server";
import {
  authenticateApiUser,
  getCategoryScope,
} from "@/app/lib/auth/serverAuth";
import { traceWithUserId } from "@/app/api/v1/apiUtils";
import {
  applyDistributionStrategy,
  DistributionStrategy,
} from "@/app/api/common/ballots/ballotDistributionStrategy";
import { z } from "zod";

const distributionMethodValidator = z.enum(
  Object.values(DistributionStrategy) as [string, ...string[]]
);

export async function POST(
  request: NextRequest,
  route: {
    params: {
      roundId: string;
      ballotCasterAddressOrEns: string;
      distributionMethod: string;
    };
  }
) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const { roundId, ballotCasterAddressOrEns, distributionMethod } =
    route.params;

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

      const ballot = await applyDistributionStrategy(
        distributionMethodValidator.parse(
          distributionMethod
        ) as DistributionStrategy,
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
