export type PaginatedResult<T> = {
  meta: {
    has_next: boolean;
    total_returned: number;
    next_offset: number;
  };
  data: T;
  seed?: number;
};

export type PaginationParams = {
  limit: number;
  offset: number;
};

export async function paginateResult<T>(
  query: (skip: number, take: number) => Promise<T[]>,
  params: PaginationParams
): Promise<PaginatedResult<T[]>> {
  // retrieve one more than requested to see if there is more data
  // for user to query
  const data = await query(params.offset, params.limit + 1);

  if (!data || data.length === 0) {
    return {
      meta: {
        has_next: false,
        total_returned: 0,
        next_offset: 0,
      },
      data: [],
    };
  }

  const has_next = data.length > params.limit;
  const theData = data.slice(0, params.limit);

  return {
    meta: {
      has_next: has_next,
      total_returned: data.length - 1,
      next_offset: has_next ? params.offset + params.limit : 0,
    },
    data: theData,
  };
}
