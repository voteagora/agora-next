import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiUser } from "@/app/lib/middleware/auth";
import { traceWithUserId } from "@/app/api/v1/apiUtils";

export async function DELETE(
  request: NextRequest,
  route: {
    params: { roundId: string; impactMetricId: string; commentId: string };
  }
) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.reason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    const { roundId, impactMetricId, commentId } = route.params;
    try {
      return new Response(null, { status: 200 });
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
