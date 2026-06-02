import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ proposalId: string }> }
) {
  const params = await props.params;
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
            proposalId: params.proposalId,
          })
        : await getVotesChart({
            proposalId: params.proposalId,
          });
    return NextResponse.json(votes);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
