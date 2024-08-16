import { cache } from "react";
import {
  PaginatedResult,
  paginateResult,
  PaginationParams,
} from "@/app/lib/pagination";
import prisma from "@/app/lib/prisma";
import { DaoSlug } from "@prisma/client";
import { Changelog } from "./changelog";

async function getChangelogsForDAO({
  daoSlug,
  pagination,
}: {
  daoSlug: DaoSlug;
  pagination: PaginationParams;
}): Promise<PaginatedResult<Changelog[]>> {
  const getChangelogsQuery = async (skip: number, take: number) => {
    return prisma.changelog.findMany({
      where: {
        dao_slug: daoSlug,
      },
      orderBy: {
        created_at: "desc",
      },
      skip,
      take,
    });
  };

  return await paginateResult(getChangelogsQuery, pagination);
}
export const fetchChangelogForDAO = cache(getChangelogsForDAO);
