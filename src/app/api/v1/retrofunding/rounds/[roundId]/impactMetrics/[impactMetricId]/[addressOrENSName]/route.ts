import { viewImpactMetricApi } from "@/app/api/common/impactMetrics/viewImactMetric";
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
      impactMetricId: string;
      addressOrENSName: string;
    };
  }
) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const { roundId, addressOrENSName, impactMetricId } = route.params;
  const scopeError = await validateAddressScope(addressOrENSName, authResponse);
  if (scopeError) return scopeError;

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const view = await viewImpactMetricApi({
        addressOrENSName,
        metricId: impactMetricId,
      });
      return NextResponse.json(view);
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
