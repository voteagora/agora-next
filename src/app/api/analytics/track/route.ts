import { type NextRequest, NextResponse } from "next/server";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import prisma from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const { event_name, event_data } = await request.json();

  try {
    await prisma.analyticsEvent.create({
      data: {
        event_name,
        event_data,
      },
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
