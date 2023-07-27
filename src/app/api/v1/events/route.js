import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { authenticateAgoraApiUser } from "src/app/lib/middlewear/authenticateAgoraApiUser";

export async function GET(request) {
  // Check if the session is authenticated first
  const authResponse = authenticateAgoraApiUser(request);
  if (authResponse) {
    return authResponse;
  }

  let page = parseInt(request.nextUrl.searchParams.get("page"), 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  const pageSize = 25;
  const total_count = await prisma.events.count();
  const total_pages = Math.ceil(total_count / pageSize);

  const events = await prisma.events.findMany({
    take: pageSize,
    skip: (page - 1) * pageSize,
  });


  // Build out proposal response
  const response = {
    meta: {
      current_page: page,
      total_pages: total_pages,
      page_size: pageSize,
      total_count: total_count,
    },
    events: events.map((event) => ({
      // Just testing out, not meant for production
      id: event.id,
      kind: event.kind,
      event_data: event.event_data,
    })),
  };

  return NextResponse.json(response);
}
