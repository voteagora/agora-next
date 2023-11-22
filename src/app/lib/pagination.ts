type PaginatedResult<T> = {
  meta: {
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
  };
  data: T;
};

export async function paginatePrismaResult<T extends Array<any>>(
  result: (skip: number, take: number, ...args: any[]) => Promise<T>,
  page: number,
  pageSize: number,
  args: any[] = []
): Promise<PaginatedResult<T>> {
  const skip = (page - 1) * pageSize;
  const take = pageSize + 1;

  const data = await result(skip, take, ...args);

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
