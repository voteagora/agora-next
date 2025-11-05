import { NextResponse, type NextRequest } from "next/server";
import { traceWithUserId } from "@/app/api/v1/apiUtils";

import {
  createOptionalNumberValidator,
  createOptionalStringValidator,
} from "@/app/api/common/utils/validators";

const DEFAULT_MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;
const DEFAULT_FILTER = "all";

const filterValidator = createOptionalStringValidator(
  [
    "all",
    "eth_core",
    "op_tooling",
    "op_rnd",
    "gov_infra",
    "gov_analytics",
    "gov_leadership",
  ],
  DEFAULT_FILTER
);

const limitValidator = createOptionalNumberValidator(
  1,
  DEFAULT_MAX_LIMIT,
  DEFAULT_LIMIT
);
const offsetValidator = createOptionalNumberValidator(
  0,
  Number.MAX_SAFE_INTEGER,
  DEFAULT_OFFSET
);

export async function GET(
  request: NextRequest,
  route: { params: Promise<{ roundId: string }> }
) {
  const { roundId } = await route.params;
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");

  const { fetchProjectsApi } = await import(
    "@/app/api/common/projects/getProjects"
  );

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    const params = request.nextUrl.searchParams;
    try {
      const category = filterValidator.parse(params.get("category"));
      const limit = limitValidator.parse(params.get("limit"));
      const offset = offsetValidator.parse(params.get("offset"));

      const projects = await fetchProjectsApi({
        pagination: { limit, offset },
        round: roundId,
        category,
      });
      return NextResponse.json(projects);
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
