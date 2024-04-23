import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiUser } from "@/app/lib/middleware/auth";
import { traceWithUserId } from "@/app/api/v1/apiUtils";

import { fetchRetroFundingRounds } from "@/app/api/common/rounds/getRetroFundingRounds";

export async function GET(
  request: NextRequest,
  route: { params: { roundId: string } }
) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.reason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    const { roundId } = route.params;

    try {
      const round = await fetchRetroFundingRounds(roundId);
      return new Response(JSON.stringify(round), {
        status: 200,
      });
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
