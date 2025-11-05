import { NextResponse, type NextRequest } from "next/server";
import { traceWithUserId } from "@/app/api/v1/apiUtils";

export async function GET(
  request: NextRequest,
  route: { params: Promise<{ roundId: string }> }
) {
  const { roundId } = await route.params;
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");

  const { fetchRetroFundingRound } = await import(
    "@/app/api/common/rounds/getRetroFundingRounds"
  );

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {

    try {
      const round = await fetchRetroFundingRound(roundId);
      return NextResponse.json(round);
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
