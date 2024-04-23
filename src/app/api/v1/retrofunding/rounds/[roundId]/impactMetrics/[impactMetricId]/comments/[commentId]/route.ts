import { NextResponse, type NextRequest } from "next/server";

export async function DELETE(
  request: NextRequest,
  route: {
    params: { roundId: string; impactMetricId: string; commentId: string };
  }
) {
  const { roundId, impactMetricId, commentId } = route.params;
  return new Response(null, { status: 200 });
}
