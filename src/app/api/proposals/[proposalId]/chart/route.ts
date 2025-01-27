import { NextRequest, NextResponse } from "next/server";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { fetchVotesChartForProposal } from "@/app/api/common/votes/getVotes";

export async function GET(
  request: NextRequest,
  route: { params: { proposalId: string } }
) {
  // const authResponse = await authenticateApiUser(request);
  //
  // if (!authResponse.authenticated) {
  //   return new Response(authResponse.failReason, { status: 401 });
  // }

  try {
    const votes = await fetchVotesChartForProposal({
      proposalId: route.params.proposalId,
    });
    return NextResponse.json(votes);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
