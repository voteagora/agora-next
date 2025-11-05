import { NextResponse, NextRequest } from "next/server";
import { traceWithUserId } from "@/app/api/v1/apiUtils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roundId: string }> }
) {
  const { roundId } = await params;
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");

  const { fetchImpactMetricsApi } = await import(
    "@/app/api/common/impactMetrics/getImpactMetrics"
  );

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const impactMetrics = await fetchImpactMetricsApi(roundId);
      return NextResponse.json(impactMetrics);
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
