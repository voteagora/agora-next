import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { fetchNeedsMyVoteProposals } from "@/app/api/common/proposals/getNeedsMyVoteProposals";

export async function GET(request: NextRequest) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const address = params.get("address");

  if (!address) {
    return new Response("Address is required", { status: 400 });
  }

  try {
    const proposals = await fetchNeedsMyVoteProposals(address);

    return NextResponse.json(proposals);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
