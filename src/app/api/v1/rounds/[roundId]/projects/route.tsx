import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiUser } from "@/app/lib/middleware/auth";
import { fetchProjectsApi } from "@/app/api/common/projects/getProjects";
import { traceWithUserId } from "../../../apiUtils";

export async function GET(request: NextRequest) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.reason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    const params = request.nextUrl.searchParams;
    try {
      const projects = await fetchProjectsApi();
      return NextResponse.json(projects);
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
