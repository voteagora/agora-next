/**
 * TanStack Start createServerFn wrappers for RetroPGF actions.
 */
import { createServerFn } from "@tanstack/react-start";

import type { getRetroPGFResults as _OrigGetRetroPGFResults } from "@/app/retropgf/actions";
import type { retroPGFCategories, retroPGFSort } from "@/lib/constants";

// ─── getRetroPGFResults ───────────────────────────────────────────────────────

type GetRetroPGFResultsParams = {
  endCursor?: string;
  search: string;
  category: keyof typeof retroPGFCategories | null;
  orderBy: keyof typeof retroPGFSort;
};

const _serverGetRetroPGFResults = createServerFn({ method: "GET" })
  .inputValidator((data: GetRetroPGFResultsParams) => data)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { getRetroPGFResults: fn } = await import("@/app/retropgf/actions");
    return fn(data);
  });

export const getRetroPGFResults: typeof _OrigGetRetroPGFResults = (params) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _serverGetRetroPGFResults({
    data: params as GetRetroPGFResultsParams,
  }) as any;
