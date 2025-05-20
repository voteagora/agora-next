import { NextRequest, NextResponse } from "next/server";
import { traceWithUserId } from "../../apiUtils";

export async function GET(request: NextRequest) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { default: Tenant } = await import("@/lib/tenant/tenant");
  const { fetchMetrics } = await import("@/app/api/common/metrics/getMetrics");

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const { contracts } = Tenant.current();
      const address = contracts.token.address;
      const chainId = contracts.token.chain.id;

      const { votableSupply, totalSupply } = await fetchMetrics();

      return NextResponse.json({
        address,
        chainId,
        votableSupply,
        totalSupply,
      });
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
