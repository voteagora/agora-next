import { NextRequest, NextResponse } from "next/server";
import { traceWithUserId } from "../apiUtils";
import { ZodError } from "zod";
import {
  createOptionalNumberValidator,
  createOptionalStringValidator,
} from "../../common/utils/validators";

const DEFAULT_FILTER = "relevant";
const DEFAULT_MAX_LIMIT = 50;
const DEFAULT_LIMIT = 10;
const DEFAULT_OFFSET = 0;

const filterValidator = createOptionalStringValidator(
  ["relevant", "everything"],
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

export async function GET(request: NextRequest) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { fetchProposals } = await import(
    "../../common/proposals/getProposals"
  );

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    const params = request.nextUrl.searchParams;

    try {
      const filter = filterValidator.parse(params.get("filter"));
      const limit = limitValidator.parse(params.get("limit"));
      const offset = offsetValidator.parse(params.get("offset"));
      const proposalsResult = await fetchProposals({
        pagination: {
          limit,
          offset,
        },
        filter,
      });
      return NextResponse.json(proposalsResult);
    } catch (e: any) {
      if (e instanceof ZodError) {
        return new Response("Invalid query parameters: " + e.toString(), {
          status: 400,
        });
      }

      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
