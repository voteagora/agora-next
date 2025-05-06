import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

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
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { traceWithUserId } = await import("@/app/api/v1/apiUtils");
  const { applyDistributionStrategy } = await import(
    "@/app/api/common/ballots/ballotDistributionStrategy"
  );
  const { DistributionStrategy } = await import(
    "@/app/api/common/ballots/ballotDistributionStrategy"
  );
  const { getCategoryScope } = await import("@/app/lib/auth/serverAuth");

  const distributionMethodValidator = z.enum(
    Object.values(DistributionStrategy) as [string, ...string[]]
  );

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
