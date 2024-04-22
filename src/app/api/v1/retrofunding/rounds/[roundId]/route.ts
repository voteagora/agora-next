import { NextResponse, type NextRequest } from "next/server";
import { fetchRetroFundingRounds } from "@/app/api/common/rounds/getRetroFundingRounds";

export async function GET(
  request: NextRequest,
  route: { params: { roundId: string } }
) {
  const { roundId } = route.params;
  const round = await fetchRetroFundingRounds(roundId);
  return new Response(JSON.stringify(round), {
    status: 200,
  });
}
