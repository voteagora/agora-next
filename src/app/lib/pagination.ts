type PaginatedResult<T> = {
  meta: {
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
  };
  data: T;
};

export async function paginateResult<T extends Array<any>>(
  query: (skip: number, take: number) => Promise<T>,
  page: number,
  pageSize: number
): Promise<PaginatedResult<T>> {
  const skip = (page - 1) * pageSize;
  const take = pageSize + 1;

  return await paginateResultEx<T>(query, take, skip);
}

export async function paginateResultEx<T extends Array<any>>(
  query: (skip: number, take: number) => Promise<T>,
  limit: number,
  offest: number
): Promise<PaginatedResult<T>> {
  const data = await query(offest, limit);

  if (!data || data.length === 0) {
    return {
      meta: { currentPage: 0, pageSize: 0, hasNextPage: false },
      data: [] as any as T,
    };
  }

  const hasNextPage = data.length > limit;
  const theData = data.slice(0, limit) as T;

  return {
    meta: {
      currentPage: 1,
      pageSize: limit,
      hasNextPage,
    },
    data: theData,
  };
}