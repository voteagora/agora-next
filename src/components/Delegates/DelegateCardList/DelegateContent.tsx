"use client";

import { useLayout } from "@/contexts/LayoutContext";
import DelegateCardList from "./DelegateCardList";
import DelegateTable from "./DelegateTable";
import { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { Delegation } from "@/app/api/common/delegations/delegation";

interface Props {
  isDelegatesCitizensFetching: boolean;
  initialDelegates: PaginatedResult<DelegateChunk[]>;
  fetchDelegates: (
    pagination: PaginationParams,
    seed?: number
  ) => Promise<PaginatedResult<DelegateChunk[]>>;
  fetchDelegators: (addressOrENSName: string) => Promise<Delegation[] | null>;
}

export default function DelegateContent({
  initialDelegates,
  fetchDelegates,
  isDelegatesCitizensFetching,
  fetchDelegators,
}: Props) {
  const { layout } = useLayout();

  return layout === "grid" ? (
    <DelegateCardList
      isDelegatesCitizensFetching={isDelegatesCitizensFetching}
      initialDelegates={initialDelegates}
      fetchDelegates={fetchDelegates}
      // @ts-ignore
      fetchDelegators={fetchDelegators}
    />
  ) : (
    <DelegateTable
      initialDelegates={initialDelegates}
      fetchDelegates={fetchDelegates}
    />
  );
}
