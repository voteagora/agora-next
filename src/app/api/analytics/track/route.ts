import { type NextRequest, NextResponse } from "next/server";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { prismaWeb2Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";

export async function POST(request: NextRequest) {
  const { slug } = Tenant.current();
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const { event_name, event_data } = await request.json();

  try {
    await prismaWeb2Client.analyticsEvent.create({
      data: {
        event_name,
        event_data,
        dao_slug: slug,
      },
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
