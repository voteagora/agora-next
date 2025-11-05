import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ proposalId: string }> }
) {
  const { proposalId } = await params;
  const { getVotesChart } = await import("@/app/api/proposals/getVotesChart");
  const { getSnapshotVotesChart } = await import(
    "@/app/api/proposals/getVotesChart"
  );

  const searchParams = request.nextUrl.searchParams;
  const proposalType = searchParams.get("proposalType");
  try {
    const votes =
      proposalType === "SNAPSHOT"
        ? await getSnapshotVotesChart({
            proposalId,
          })
        : await getVotesChart({
            proposalId,
          });
    return NextResponse.json(votes);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
