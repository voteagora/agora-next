import { NextRequest, NextResponse } from "next/server";
import { traceWithUserId } from "@/app/api/v1/apiUtils";

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
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { validateAddressScope } = await import("@/app/lib/auth/serverAuth");

  const { viewImpactMetricApi } = await import(
    "@/app/api/common/impactMetrics/viewImactMetric"
  );

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
