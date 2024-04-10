import { NextResponse, type NextRequest } from "next/server";
import { fetchDelegate } from "@/app/api/common/delegates/getDelegates";
import { authenticateApiUser } from "@/app/lib/middleware/auth";
import { addSpanAttributes } from "@/app/lib/logging";

export async function GET(request: NextRequest) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.reason, { status: 401 });
  }

  addSpanAttributes({ user_id: authResponse.userId });

  try {
    const addressOrENSName = request.nextUrl.pathname.split("/")[4];
    const delegate = await fetchDelegate(addressOrENSName);
    return NextResponse.json(delegate);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
