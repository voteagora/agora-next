import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { NextRequest, NextResponse } from "next/server";
import { traceWithUserId } from "../../apiUtils";
import Tenant from "@/lib/tenant/tenant";
import { fetchMetrics } from "@/app/api/common/metrics/getMetrics";

export async function GET(request: NextRequest) {
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
