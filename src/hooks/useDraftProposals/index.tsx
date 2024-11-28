"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import action from "./action";
import { useIsMounted } from "connectkit";

export const createQueryKey = ({
  address,
  filter,
  sort,
}: {
  address?: `0x${string}`;
  filter: string;
  sort: string;
}) => ["draftProposals", filter, sort, address] as const;

export const useDraftProposalsInfinite = ({
  address,
  filter,
  sort,
  pagination,
}: {
  address?: `0x${string}`;
  filter: string;
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
    queryKey: createQueryKey({ address, filter, sort }),
    queryFn: ({ pageParam = 0 }) =>
      action(address, filter, sort, {
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

export const useDraftProposals = ({
  address,
  filter,
  sort,
}: {
  address?: `0x${string}`;
  filter: string;
  sort: string;
}) => {
  const isMounted = useIsMounted();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: createQueryKey({ address, filter, sort }),
    queryFn: () => {
      return action(address, filter, sort, { limit: 10, offset: 0 });
    },
    enabled: isMounted && !!address,
  });

  return { data, isLoading, error, refetch };
};
