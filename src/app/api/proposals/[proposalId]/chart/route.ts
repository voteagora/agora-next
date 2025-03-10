import { NextRequest, NextResponse } from "next/server";
import {
  getSnapshotVotesChart,
  getVotesChart,
} from "@/app/api/proposals/getVotesChart";

export async function GET(
  request: NextRequest,
  route: { params: { proposalId: string } }
) {
  const searchParams = request.nextUrl.searchParams;
  const proposalType = searchParams.get("proposalType");
  try {
    const votes =
      proposalType === "SNAPSHOT"
        ? await getSnapshotVotesChart({
            proposalId: route.params.proposalId,
          })
        : await getVotesChart({
            proposalId: route.params.proposalId,
          });
    return NextResponse.json(votes);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
