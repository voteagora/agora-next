import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { proposalId: string } }
) {
  const { getVotesChart } = await import("@/app/api/proposals/getVotesChart");

  try {
    const { proposalId } = params;
    const chart = await getVotesChart({ proposalId });
    return NextResponse.json(chart);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
