"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import DelegateCardList from "./DelegateCardList";
import DelegateTable from "./DelegateTable";
import { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { useQueryState, parseAsString } from "nuqs";
import { useDelegatesFilter } from "@/components/Delegates/DelegatesFilter/useDelegatesFilter";
import { useDelegatesSort } from "@/components/Delegates/DelegatesFilter/useDelegatesSort";
import { buildDelegateFilters } from "./delegateUtils";
import {
  ENDORSED_FILTER_PARAM,
  HAS_STATEMENT_FILTER_PARAM,
} from "@/lib/constants";

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
  const [delegates, setDelegates] =
    useState<PaginatedResult<DelegateChunk[]>>(initialDelegates);

  const [layout] = useQueryState("layout", parseAsString.withDefault("grid"));
  const [tab] = useQueryState("tab", parseAsString.withDefault("delegates"));

  const { issuesFromUrl, stakeholdersFromUrl, hasMyDelegates, activeFilters } =
    useDelegatesFilter();

  const { orderByParam } = useDelegatesSort();

  const fetchDelegatesStable = useCallback(
    (pagination: PaginationParams) => {
      const params = {
        endorsedFilter: activeFilters.includes(ENDORSED_FILTER_PARAM),
        hasStatementFilter: activeFilters.includes(HAS_STATEMENT_FILTER_PARAM),
        myDelegatesFilter: hasMyDelegates ? "true" : "",
        issuesFilter: issuesFromUrl,
        stakeholdersFilter: stakeholdersFromUrl,
        tab,
        orderBy: orderByParam,
      };

      const filters = buildDelegateFilters(params);

      return fetchDelegates(pagination, Math.random(), orderByParam, filters);
    },
    [
      fetchDelegates,
      activeFilters,
      hasMyDelegates,
      issuesFromUrl,
      stakeholdersFromUrl,
      tab,
      orderByParam,
      initialDelegates,
    ]
  );

  useEffect(() => {
    const updateDelegates = async () => {
      try {
        const updatedDelegates = await fetchDelegatesStable({
          limit: 10,
          offset: 0,
        });

        setDelegates(updatedDelegates);
      } catch (error) {
        console.error("Error updating delegates:", error);
      }
    };

    updateDelegates();
  }, [fetchDelegatesStable]);

  return layout === "grid" ? (
    <DelegateCardList
      initialDelegates={delegates}
      fetchDelegates={fetchDelegatesStable}
    />
  ) : (
    <DelegateTable
      initialDelegates={delegates}
      fetchDelegates={fetchDelegatesStable}
    />
  );
}
