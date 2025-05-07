// export const dynamic = 'force-dynamic'; // this line is uncommented for e2e tests

import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {

  const { fetchVotableSupply } = await import("@/app/api/common/votableSupply/getVotableSupply");

  try {
    const votable_supply = await fetchVotableSupply();
    return NextResponse.json({ votable_supply });
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
