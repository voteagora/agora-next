import { type NextRequest, NextResponse } from "next/server";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { apiFetchMetricTS } from "@/app/api/analytics/metric/[metric_id]/[frequency]/getMetricsTS";

export async function GET(request: NextRequest) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const paramParts = request.nextUrl.pathname.split("/");

  // This seems dangerous.  There must be a better way.
  // I picked up this pattern from other areas of our code base.
  const frequency = paramParts[5];
  const metricId = paramParts[4];

  try {
    const communityInfo = await apiFetchMetricTS(metricId, frequency);
    return NextResponse.json(communityInfo);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
