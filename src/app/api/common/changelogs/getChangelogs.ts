import { cache } from "react";
import {
  PaginatedResult,
  paginateResult,
  PaginationParams,
} from "@/app/lib/pagination";
import { prismaWeb2Client } from "@/app/lib/prisma";
import { DaoSlug } from "@prisma/client";
import { Changelog } from "./changelog";

async function getChangelogsForDAO({
  daoSlug,
  pagination,
}: {
  daoSlug: DaoSlug;
  pagination: PaginationParams;
}): Promise<PaginatedResult<Changelog[]>> {
  try {
    const getChangelogsQuery = async (skip: number, take: number) => {
      return prismaWeb2Client.changelog.findMany({
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
  } catch (error: any) {
    if (error?.code === "P2021") {
      return {
        meta: {
          has_next: false,
          total_returned: 0,
          next_offset: 0,
        },
        data: [],
      };
    }

    throw error;
  }
}
export const fetchChangelogForDAO = cache(getChangelogsForDAO);
