"use client";

import DelegateCardList from "./DelegateCardList";
import DelegateTable from "./DelegateTable";
import { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { useQueryState, parseAsString } from "nuqs";

interface Props {
  initialDelegates: PaginatedResult<DelegateChunk[]>;
  fetchDelegates: (
    pagination: PaginationParams,
    seed?: number,
    clientSort?: string,
    clientFilters?: any
  ) => Promise<PaginatedResult<DelegateChunk[]>>;
}

export default function DelegateContent({
  initialDelegates,
  fetchDelegates,
}: Props) {
  const [layout] = useQueryState("layout", parseAsString.withDefault("grid"));

  return layout === "grid" ? (
    <DelegateCardList
      initialDelegates={initialDelegates}
      fetchDelegates={fetchDelegates}
    />
  ) : (
    <DelegateTable
      initialDelegates={initialDelegates}
      fetchDelegates={fetchDelegates}
    />
  );
}
