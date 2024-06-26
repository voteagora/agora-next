import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { fetchBallots } from "@/app/api/common/ballots/getBallots";

export async function GET(
  request: NextRequest,
  route: { params: { roundId: string } }
) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }
  return await traceWithUserId(authResponse.userId as string, async () => {
    const params = request.nextUrl.searchParams;
    try {
      const { roundId } = route.params;
      const limit = Number(params.get("limit")) || 10;
      const offset = Number(params.get("offset")) || 0;
      const ballots = await fetchBallots({
        roundId: Number(roundId),
        limit,
        offset,
      });
      return NextResponse.json(ballots);
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
