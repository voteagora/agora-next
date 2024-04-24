import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiUser } from "@/app/lib/middleware/auth";
import { traceWithUserId } from "@/app/api/v1/apiUtils";

import { fetchProjectsApi } from "@/app/api/common/projects/getProjects";

export async function GET(request: NextRequest) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.reason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const projects = await fetchProjectsApi();
      return new Response(JSON.stringify(projects), {
        status: 200,
      });
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}