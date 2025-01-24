import { type NextRequest, NextResponse } from "next/server";
import { fetchAllForVoting } from "@/app/api/votes/getVotes";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const address = params.get("address");
  const blockNumber = params.get("blockNumber");
  const proposalId = params.get("proposalId");

  if (!address || !blockNumber || !proposalId) {
    return new Response("Missing address, blockNumber, or proposalId", {
      status: 400,
    });
  }

  try {
    const allVotes = await fetchAllForVoting(
      address,
      Number(blockNumber),
      proposalId
    );
    return NextResponse.json(allVotes);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
