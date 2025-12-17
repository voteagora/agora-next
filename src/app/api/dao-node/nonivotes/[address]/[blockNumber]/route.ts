import { getUserNonIVotesVPAtBlock } from "@/app/lib/dao-node/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string; blockNumber: string } }
) {
  const { address, blockNumber } = params;

  if (!address || !blockNumber) {
    return NextResponse.json(
      { error: "Missing address or blockNumber" },
      { status: 400 }
    );
  }

  const blockNum = parseInt(blockNumber, 10);
  if (isNaN(blockNum)) {
    return NextResponse.json(
      { error: "Invalid block number" },
      { status: 400 }
    );
  }

  try {
    const vp = await getUserNonIVotesVPAtBlock(address, blockNum);
    return NextResponse.json({ vp: vp || "0" });
  } catch (error) {
    console.error("Error fetching voting power:", error);
    return NextResponse.json(
      { error: "Failed to fetch voting power" },
      { status: 500 }
    );
  }
}
