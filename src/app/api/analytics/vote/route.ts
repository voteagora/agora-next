import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { apiFetchProposalVoteCounts } = await import(
    "@/app/api/analytics/vote/getProposalVoteCounts"
  );

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  try {
    const communityInfo = await apiFetchProposalVoteCounts();
    return NextResponse.json(communityInfo);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
