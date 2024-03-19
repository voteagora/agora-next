import { type NextRequest } from "next/server"

import { fetchDelegates } from "@/app/api/common/delegates/getDelegates";
import {
  type Delegate,
  type DelegatePayload,
  type DelegatesGetPayload,
} from "@/app/api/common/delegates/delegate";

export async function GET(request: NextRequest) {
  /*
      request or query params will include sort, limit, offeest
  */
  const params = request.nextUrl.searchParams;
  const page = params.get("page") || 1;
  const sort = params.get("sort") || "most_delegators";
  const delegatesResult = await fetchDelegates({ page: 1, sort: "most_delegators" });
  return Response.json(delegatesResult.delegates);
}