import { NextRequest, NextResponse } from "next/server";
import { ExecutionTransaction } from "@/lib/types";
import Tenant from "@/lib/tenant/tenant";
import { prismaWeb3Client } from "@/app/lib/web3";

export async function GET(request: NextRequest) {
  try {
    const { namespace } = Tenant.current();
    const url = new URL(request.url);
    const proposalId = url.searchParams.get("proposalId");

    if (!proposalId) {
      return NextResponse.json(
        { error: "proposalId parameter is required" },
        { status: 400 }
      );
    }

    // Fetch transactions from database
    const transactions =
      await prismaWeb3Client.proposalExecutionTransaction.findMany({
        where: {
          tenant: namespace,
          proposal_id: proposalId,
        },
        orderBy: {
          executed_at: "desc",
        },
      });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching execution transactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
