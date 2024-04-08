export type PaginatedResult<T> = {
  meta: {
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
  };
  data: T;
};

export type PaginatedResultEx<T> = {
  meta: {
    hasNext: boolean;
    totalReturned: number;
    nextOffset: number;
  };
  data: T;
};

export type PaginationParams = {
  page: number;
  pageSize: number;
};

export type PaginationParamsEx = {
  limit: number;
  offset: number;
};

export async function paginateResult<T extends Array<any>>(
  query: (skip: number, take: number) => Promise<T>,
  page: number,
  pageSize: number
): Promise<PaginatedResult<T>> {
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const ex = await paginateResultEx<T>(query, { limit: take, offset: skip });

  return {
    meta: {
      currentPage: page,
      pageSize: pageSize,
      hasNextPage: ex.meta.hasNext,
    },
    data: ex.data,
  };
}

export async function paginateResultEx<T extends Array<any>>(
  query: (skip: number, take: number) => Promise<T>,
  params: PaginationParamsEx
): Promise<PaginatedResultEx<T>> {
  // retrieve one more than requested to see if there is more data
  // for user to query
  const data = await query(params.offset, params.limit + 1);

  if (!data || data.length === 0) {
    return {
      meta: {
        hasNext: false,
        totalReturned: 0,
        nextOffset: 0
      },
      data: [] as any as T,
    };
  }

  const has_next = data.length > params.limit;
  const theData = data.slice(0, params.limit) as T;

  return {
    meta: {
      hasNext: has_next,
      totalReturned: data.length - 1,
      nextOffset: has_next ? params.offset + params.limit : 0,
    },
    data: theData,
  };
}
