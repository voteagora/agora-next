import { type NextRequest, NextResponse } from "next/server";
import Tenant from "@/lib/tenant/tenant";
import { fetchRawProposalNonVotersFromArchive } from "@/lib/archiveUtils";

export async function GET(
  _request: NextRequest,
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
    // Fetch raw non-voter data from archive - transformation happens on client side
    const rawNonVoters = await fetchRawProposalNonVotersFromArchive({
      namespace,
      proposalId,
    });

    return NextResponse.json({ data: rawNonVoters });
  } catch (error) {
    console.error("Error fetching archive non-voters:", error);
    return NextResponse.json(
      { error: "Failed to fetch archive non-voters" },
      { status: 500 }
    );
  }
}
