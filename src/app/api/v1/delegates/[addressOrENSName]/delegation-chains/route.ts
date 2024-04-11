import { NextResponse, type NextRequest } from "next/server";
import { fetchAllDelegatorsInChains } from "@/app/api/common/delegations/getDelegations";
import { authenticateApiUser } from "@/app/lib/middleware/auth";

export async function GET(request: NextRequest) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.reason, { status: 401 });
  }

  try {
    const addressOrENSName = request.nextUrl.pathname.split("/")[4];
    const delegate = await fetchAllDelegatorsInChains(addressOrENSName);
    return NextResponse.json(delegate);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
