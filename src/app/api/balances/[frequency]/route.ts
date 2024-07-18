import { type NextRequest, NextResponse } from "next/server";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { apiFetchTreasuryBalanceTS } from "@/app/api/balances/[frequency]/getTreasuryBalanceTS";

export async function GET(request: NextRequest) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const frequency = request.nextUrl.pathname.split("/")[3];

  try {
    const communityInfo = await apiFetchTreasuryBalanceTS(frequency);
    return NextResponse.json(communityInfo);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
