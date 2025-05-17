"use server";

import { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { fetchDelegates as apiFetchDelegates } from "@/app/api/common/delegates/getDelegates";
import { DelegateFilters } from "./delegateUtils";

export async function fetchDelegatesServerAction(
  pagination: PaginationParams,
  seed: number,
  sort: string,
  filters?: DelegateFilters
): Promise<PaginatedResult<DelegateChunk[]>> {
  return apiFetchDelegates({
    pagination,
    seed,
    sort,
    filters,
  });
}
