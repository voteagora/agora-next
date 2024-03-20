import { NextResponse, type NextRequest } from "next/server"
import { ZodError, z } from "zod";

import { fetchDelegates } from "@/app/api/common/delegates/getDelegates";
import {
  type Delegate,
  type DelegatePayload,
  type DelegatesGetPayload,
} from "@/app/api/common/delegates/delegate";

const DEFAULT_SORT = "most_delegators";
const DEFAULT_MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  try {
    const sort = z.literal("most_delegators").or(z.literal("weighted_random")).parse(params.get("sort")) || DEFAULT_SORT;
    const limit = z.number().min(1).max(DEFAULT_MAX_LIMIT).parse(params.get("limit")) || DEFAULT_LIMIT;
    const offest = z.number().min(0).parse(params.get("offset")) || DEFAULT_OFFSET;
    const delegatesResult = await fetchDelegates({ sort: sort, limit: limit, offset: offest});
    return Response.json(delegatesResult.delegates);
  }
  catch (e: any) {
    if (e instanceof ZodError) {
      return new Response("Invalid query parameters", { status: 400 });
    }

    return new Response("Internal server error", { status: 500 });
  }
}