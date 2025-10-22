/**
 * Server actions for fetching dynamic page content
 * Read-only operations for the block-based page system
 */

import { prismaWeb2Client } from "@/app/lib/prisma";
import { DaoSlug } from "@prisma/client";
import { cache } from "react";

/**
 * Get page content with blocks from database
 * Cached to avoid redundant queries within the same request
 */
export const getPageContent = cache(
  async (
    dao_slug: DaoSlug,
    route: string,
    version: "draft" | "published" = "published"
  ) => {
    try {
      // Check if the table exists by catching the error
      const page = await prismaWeb2Client.page.findUnique({
        where: {
          dao_slug_route_version: {
            dao_slug,
            route,
            version,
          },
        },
        include: {
          blocks: {
            where: {
              enabled: true,
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      });

      return page;
    } catch (error: any) {
      // Table doesn't exist yet or other DB error - fail gracefully
      if (
        error?.code === "P2021" ||
        error?.message?.includes("relation") ||
        error?.message?.includes("does not exist")
      ) {
        console.log(
          `Page table not yet migrated for ${dao_slug}/${route}, using fallback`
        );
        return null;
      }
      console.error(
        `Error fetching page content for ${dao_slug}/${route}:`,
        error
      );
      return null;
    }
  }
);

/**
 * Check if a dynamic page exists for a given route
 * Useful for route resolution and fallback logic
 */
export const pageExists = cache(
  async (
    dao_slug: DaoSlug,
    route: string,
    version: "draft" | "published" = "published"
  ): Promise<boolean> => {
    try {
      const page = await prismaWeb2Client.page.findUnique({
        where: {
          dao_slug_route_version: {
            dao_slug,
            route,
            version,
          },
        },
        select: {
          id: true,
        },
      });

      return !!page;
    } catch (error: any) {
      // Table doesn't exist yet - return false
      if (
        error?.code === "P2021" ||
        error?.message?.includes("relation") ||
        error?.message?.includes("does not exist")
      ) {
        return false;
      }
      console.error(
        `Error checking page existence for ${dao_slug}/${route}:`,
        error
      );
      return false;
    }
  }
);

/**
 * Get all routes for a given DAO
 * Useful for sitemap generation and navigation
 */
export const getAvailableRoutes = cache(
  async (dao_slug: DaoSlug, version: "draft" | "published" = "published") => {
    try {
      const pages = await prismaWeb2Client.page.findMany({
        where: {
          dao_slug,
          version,
        },
        select: {
          route: true,
          meta_title: true,
          meta_description: true,
          published_at: true,
        },
        orderBy: {
          route: "asc",
        },
      });

      return pages;
    } catch (error: any) {
      // Table doesn't exist yet - return empty array
      if (
        error?.code === "P2021" ||
        error?.message?.includes("relation") ||
        error?.message?.includes("does not exist")
      ) {
        return [];
      }
      console.error(`Error fetching available routes for ${dao_slug}:`, error);
      return [];
    }
  }
);
