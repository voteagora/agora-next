import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { traceWithUserId } from "@/app/api/v1/apiUtils";
import { fetchProjectApi } from "@/app/api/common/projects/getProjects";

export async function GET(
  request: NextRequest,
  route: { params: { roundId: string; projectId: string } }
) {
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const { roundId, projectId } = route.params;

      const projects = await fetchProjectApi({
        round: roundId,
        projectId,
      });
      return NextResponse.json(projects);
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
