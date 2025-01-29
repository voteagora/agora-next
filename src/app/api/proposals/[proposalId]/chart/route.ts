import { NextRequest, NextResponse } from "next/server";
import { getVotesChart } from "@/app/api/proposals/getVotesChart";

export async function GET(
  request: NextRequest,
  route: { params: { proposalId: string } }
) {
  try {
    const votes = await getVotesChart({
      proposalId: route.params.proposalId,
    });
    return NextResponse.json(votes);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
