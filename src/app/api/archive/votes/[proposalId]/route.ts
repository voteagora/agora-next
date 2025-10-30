import { type NextRequest, NextResponse } from "next/server";
import Tenant from "@/lib/tenant/tenant";
import { fetchRawProposalVotesFromArchive } from "@/lib/archiveUtils";

export async function GET(
  request: NextRequest,
  { params }: { params: { proposalId: string } }
) {
  const { proposalId } = params;
  if (!proposalId) {
    return NextResponse.json(
      { error: "Missing proposal id" },
      { status: 400 }
    );
  }

  const { namespace } = Tenant.current();

  try {
    // Fetch raw vote data from archive - transformation happens on client side
    const rawVotes = await fetchRawProposalVotesFromArchive({
      namespace,
      proposalId,
    });

    return NextResponse.json({ data: rawVotes });
  } catch (error) {
    console.error("Error fetching archive votes:", error);
    return NextResponse.json(
      { error: "Failed to fetch archive votes" },
      { status: 500 }
    );
  }
}
