"use client";

import { useEffect, useState } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import action from "./action";
import { useIsMounted } from "connectkit";
import { PaginationParams } from "@/app/lib/pagination";

export const createQueryKey = ({
  address,
  sort,
}: {
  address?: `0x${string}`;
  sort: string;
}) => ["myDraftProposals", sort, address] as const;

export const useMyDraftProposalsInfinite = ({
  address,
  sort,
  pagination,
}: {
  address?: `0x${string}`;
  sort: string;
  pagination: {
    limit: number;
    offset: number;
  };
}) => {
  const isMounted = useIsMounted();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    refetch,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: createQueryKey({ address, sort }),
    queryFn: ({ pageParam = 0 }) =>
      action(address, sort, {
        limit: pagination.limit,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage, pages) =>
      lastPage.meta.has_next ? lastPage.meta.next_offset : null,
    initialPageParam: 0,
    enabled: !!address && isMounted,
  });

  const proposals = data?.pages.flatMap((page) => page.data) || [];

  return {
    raw_data: data,
    data: proposals,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    refetch,
    isFetchingNextPage,
  };
};

const useMyDraftProposals = ({
  address,
  sort,
  pagination,
}: {
  address?: `0x${string}`;
  sort: string;
  pagination: PaginationParams;
}) => {
  const [hasMounted, setHasMounted] = useState(false);

  // required for fixing the strange error where the query pends forever on first load if filter contains value
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["myDraftProposals", address],
    queryFn: () => {
      return action(address, sort, pagination);
    },
    enabled: hasMounted,
  });

  return { data, isLoading, error };
};

export default useMyDraftProposals;
