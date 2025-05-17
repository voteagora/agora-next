"use server";

import { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { fetchCitizens as apiFetchCitizens } from "@/app/api/common/citizens/getCitizens";

export async function fetchCitizensServerAction(
  pagination: PaginationParams,
  seed: number,
  sort: string
): Promise<PaginatedResult<DelegateChunk[]>> {
  return apiFetchCitizens({
    pagination,
    seed,
    sort: sort || "shuffle",
  });
}
