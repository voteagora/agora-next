import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
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
      const ballot = await applyDistributionStrategy(
        distributionMethod as DistributionStrategy,
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
