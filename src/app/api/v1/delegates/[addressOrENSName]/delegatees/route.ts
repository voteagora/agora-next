import { NextResponse, type NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  route: { params: { addressOrENSName: string } }
) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { traceWithUserId } = await import("../../../apiUtils");
  const { fetchCurrentDelegatees } = await import(
    "@/app/api/common/delegations/getDelegations"
  );

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const { addressOrENSName } = route.params;
      const delegate = await fetchCurrentDelegatees(addressOrENSName);
      return NextResponse.json(delegate);
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
