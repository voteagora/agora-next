"use server";

import { handlePrismaError } from "./shared";
import Tenant from "@/lib/tenant/tenant";
import { prismaWeb2Client } from "@/app/lib/prisma";

const { slug } = Tenant.current();

export async function getForumCategories() {
  try {
    const categories = await prismaWeb2Client.forumCategory.findMany({
      where: {
        dao_slug: slug,
        archived: false,
      },
      include: {
        _count: {
          select: {
            topics: {
              where: {
                archived: false,
                deletedAt: null,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: categories.map((category) => ({
        ...category,
        topicsCount: category._count.topics,
      })),
    };
  } catch (error) {
    console.error("Error getting forum categories:", error);
    return handlePrismaError(error);
  }
}

export async function getForumCategory(categoryId: number) {
  try {
    const category = await prismaWeb2Client.forumCategory.findFirst({
      where: {
        id: categoryId,
        dao_slug: slug,
      },
      include: {
        _count: {
          select: {
            topics: {
              where: {
                archived: false,
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    if (!category) {
      return {
        success: false,
        error: "Category not found",
      };
    }

    return {
      success: true,
      data: {
        ...category,
        topicsCount: category._count.topics,
      },
    };
  } catch (error) {
    console.error("Error getting forum category:", error);
    return handlePrismaError(error);
  }
}

export async function getDunaCategoryId(): Promise<number | null> {
  try {
    const dunaCategory = await prismaWeb2Client.forumCategory.findFirst({
      where: {
        dao_slug: slug,
        isDuna: true,
        archived: false,
      },
      select: {
        id: true,
      },
    });

    return dunaCategory ? dunaCategory.id : null;
  } catch (error) {
    console.error("Error getting duna category ID:", error);
    return null;
  }
}
