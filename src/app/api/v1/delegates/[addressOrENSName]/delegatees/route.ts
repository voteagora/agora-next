import { NextResponse, type NextRequest } from "next/server";
import { traceWithUserId } from "../../../apiUtils";

export async function GET(
  request: NextRequest,
  route: { params: Promise<{ addressOrENSName: string }> }
) {
  const { addressOrENSName } = await route.params;
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");

  const { fetchCurrentDelegatees } = await import(
    "@/app/api/common/delegations/getDelegations"
  );

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const delegate = await fetchCurrentDelegatees(addressOrENSName);
      return NextResponse.json(delegate);
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
