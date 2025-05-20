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
      const { contracts, namespace } = Tenant.current();
      if (!contracts.alligator) {
        return new Response(`Alligator does not exist for ${namespace}`, {
          status: 404,
        });
      }
      const address = contracts.alligator.address;
      const chainId = contracts.alligator.chain.id;
      return NextResponse.json({ address, chainId });
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
