export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { findVotableSupply } = await import("@/lib/prismaUtils");
  const { default: Tenant } = await import("@/lib/tenant/tenant");

  const { namespace, contracts } = Tenant.current();
  const address = contracts.token.address;
  const slug = namespace;

  try {
    const response = await findVotableSupply({ namespace, address });
    return NextResponse.json(response);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
