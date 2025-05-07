import { NextResponse, NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { roundId: string } }
) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { traceWithUserId } = await import("@/app/api/v1/apiUtils");
  const { fetchImpactMetricsApi } = await import(
    "@/app/api/common/impactMetrics/getImpactMetrics"
  );

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const { roundId } = params;
      const impactMetrics = await fetchImpactMetricsApi(roundId);
      return NextResponse.json(impactMetrics);
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
