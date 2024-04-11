import { NextResponse, type NextRequest } from "next/server";
import { ZodError, z } from "zod";

import { authenticateApiUser } from "@/app/lib/middleware/auth";
import { fetchDelegatesApi } from "@/app/api/common/delegates/getDelegates";
import {
  type Delegate,
  type DelegatePayload,
  type DelegatesGetPayload,
} from "@/app/api/common/delegates/delegate";

import {
  createOptionalNumberValidator,
  createOptionalStringValidator,
} from "@/app/api/common/utils/validators";
import { withUserId } from "../apiUtils";

const DEFAULT_SORT = "most_delegators";
const DEFAULT_MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;

const sortValidator = createOptionalStringValidator(
  ["most_delegators", "weighted_random"],
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
    return new Response(authResponse.reason, { status: 401 });
  }

  return await withUserId(authResponse.userId as string, async () => {
    const params = request.nextUrl.searchParams;
    try {
      const sort = sortValidator.parse(params.get("sort"));
      const limit = limitValidator.parse(params.get("limit"));
      const offest = offsetValidator.parse(params.get("offset"));
      const delegatesResult = await fetchDelegatesApi(sort, {
        limit: limit,
        offset: offest,
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
