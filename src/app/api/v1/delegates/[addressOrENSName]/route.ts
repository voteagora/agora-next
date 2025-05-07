import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { addressOrENSName: string } }
) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { traceWithUserId } = await import("../../apiUtils");
  const { fetchDelegate } = await import(
    "@/app/api/common/delegates/getDelegates"
  );

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  try {
    const { addressOrENSName } = params;
    const delegate = await fetchDelegate(addressOrENSName);
    return NextResponse.json(delegate);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
