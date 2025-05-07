import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { apiFetchDelegateWeights } = await import(
    "@/app/api/analytics/top/delegates/getTopDelegateWeighs"
  );

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  try {
    const weights = await apiFetchDelegateWeights();
    return NextResponse.json(weights);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
