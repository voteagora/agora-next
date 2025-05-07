import { NextRequest, NextResponse } from "next/server";
import { traceWithUserId } from "../../apiUtils";

export async function GET(request: NextRequest) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { default: Tenant } = await import("@/lib/tenant/tenant");

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const { contracts } = Tenant.current();
      return NextResponse.json({
        address: contracts.governor.address,
        abi: contracts.governor.abi,
      });
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
