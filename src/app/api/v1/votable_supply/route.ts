import { NextResponse, type NextRequest } from "next/server";
import { fetchVotableSupply } from "@/app/api/common/votableSupply/getVotableSupply";

export async function GET(request: NextRequest) {
  try {
    const votable_supply = await fetchVotableSupply();
    return NextResponse.json({ votable_supply });
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
