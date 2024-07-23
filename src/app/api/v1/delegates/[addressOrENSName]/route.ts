import { NextResponse, type NextRequest } from "next/server";
import { fetchDelegate } from "@/app/api/common/delegates/getDelegates";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { traceWithUserId } from "../../apiUtils";

export async function GET(
  request: NextRequest,
  route: { params: { addressOrENSName: string } }
) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const { addressOrENSName } = route.params;
      const delegate = await fetchDelegate(addressOrENSName);
      return NextResponse.json(delegate);
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
