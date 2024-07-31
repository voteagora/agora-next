import { NextRequest, NextResponse } from "next/server";
import {
  createOptionalNumberValidator,
  createOptionalStringValidator,
} from "../../common/utils/validators";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { traceWithUserId } from "../apiUtils";
import { ZodError } from "zod";
import { fetchProposals } from "../../common/proposals/getProposals";

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
      const delegatesResult = await fetchProposals({
        pagination: {
          limit,
          offset,
        },
        filter,
      });
      return NextResponse.json(delegatesResult);
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
