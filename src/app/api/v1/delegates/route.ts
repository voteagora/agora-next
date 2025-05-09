import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";
import { fetchDelegates } from "@/app/api/common/delegates/getDelegates";

import {
  createOptionalNumberValidator,
  createOptionalStringValidator,
} from "@/app/api/common/utils/validators";
import { traceWithUserId } from "../apiUtils";

const DEFAULT_SORT = "voting_power";
const DEFAULT_MAX_LIMIT = 1500;
const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;

const sortValidator = createOptionalStringValidator(
  ["most_delegators", "weighted_random", "voting_power", "least_voting_power"],
  DEFAULT_SORT
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
      const sort = sortValidator.parse(params.get("sort"));
      const limit = limitValidator.parse(params.get("limit"));
      const offset = offsetValidator.parse(params.get("offset"));
      const delegatesResult = await fetchDelegates({
        pagination: {
          limit,
          offset,
        },
        sort,
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
