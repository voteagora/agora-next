import { findVotableSupply } from "@/lib/prismaUtils";
import Tenant from "@/lib/tenant/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { namespace, contracts } = Tenant.current();
  const address = contracts.token.address;
  try {
    const response = await findVotableSupply({ namespace, address });
    return NextResponse.json(response);
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
