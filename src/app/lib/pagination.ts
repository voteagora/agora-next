type PaginatedResult<T> = {
  meta: {
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
  };
  data: T;
};

export async function paginatePrismaResult<T extends Array<any>>(
  result: (skip: number, take: number) => Promise<T>,
  page: number,
  pageSize: number
): Promise<PaginatedResult<T>> {
  const skip = (page - 1) * pageSize;
  const take = pageSize + 1;

  const data = await result(skip, take);

  if (!data || data.length === 0) {
    // return notFound();
    return {
      meta: { currentPage: 0, pageSize: 0, hasNextPage: false },
      data: [] as any as T,
    };
  }

  const hasNextPage = data.length > pageSize;
  const theData = data.slice(0, pageSize) as T;

  return {
    meta: {
      currentPage: page,
      pageSize,
      hasNextPage,
    },
    data: theData,
  };
}
