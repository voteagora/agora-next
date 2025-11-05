import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ metric_id: string; frequency: string }> }
) {
  const { metric_id, frequency } = await params;
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { apiFetchMetricTS } = await import("./getMetricsTS");

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  try {
    const communityInfo = await apiFetchMetricTS(metric_id, frequency);
    return NextResponse.json(communityInfo);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
