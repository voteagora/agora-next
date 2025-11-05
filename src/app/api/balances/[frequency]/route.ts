import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ frequency: string }> }
) {
  await params; // Await params even if not used directly
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { apiFetchTreasuryBalanceTS } = await import(
    "@/app/api/balances/[frequency]/getTreasuryBalanceTS"
  );

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  try {
    const frequency = request.nextUrl.pathname.split("/")[3];

    const communityInfo = await apiFetchTreasuryBalanceTS(frequency);
    return NextResponse.json(communityInfo);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
