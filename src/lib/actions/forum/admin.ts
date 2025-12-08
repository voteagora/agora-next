"use server";

import Tenant from "@/lib/tenant/tenant";
import { prismaWeb2Client } from "@/app/lib/prisma";
import { checkPermission, isSuperAdmin } from "@/lib/rbac";
import type { DaoSlug } from "@prisma/client";

export async function getForumAdmins() {
  try {
    const { slug } = Tenant.current();

    const admins = await prismaWeb2Client.forumAdmin.findMany({
      where: {
        managedAccounts: {
          has: slug,
        },
      },
      select: {
        address: true,
        role: true,
      },
      orderBy: {
        address: "asc",
      },
    });

    return {
      success: true as const,
      data: admins.map((admin) => ({
        address: admin.address.toLowerCase(),
        role: admin.role,
      })),
    };
  } catch (error) {
    console.error("Error fetching forum admins:", error);
    return {
      success: false as const,
      error: "Failed to load forum admins",
    };
  }
}

export async function checkForumPermissions(
  address: string,
  _categoryId?: number
) {
  try {
    const { slug } = Tenant.current();
    const daoSlug = slug as DaoSlug;

    // Check if super admin (has all permissions)
    const superAdmin = await isSuperAdmin(address);
    if (superAdmin) {
      return {
        isAdmin: true,
        canCreateTopics: true,
        canManageTopics: true,
      };
    }

    // Check specific RBAC permissions
    const [canCreateTopics, canManageTopics] = await Promise.all([
      checkPermission(address, daoSlug, "forums", "topics", "create"),
      checkPermission(address, daoSlug, "forums", "topics", "archive"),
    ]);

    // isAdmin if user has management permissions
    const isAdmin = canManageTopics;

    return {
      isAdmin,
      canCreateTopics,
      canManageTopics,
    };
  } catch (error) {
    console.error("Error checking forum permissions:", error);
    return {
      isAdmin: false,
      canCreateTopics: false,
      canManageTopics: false,
    };
  }
}

export async function logForumAuditAction(
  daoSlug: string,
  adminAddress: string,
  action: string,
  targetType: "topic" | "post",
  targetId: number
): Promise<void> {
  try {
    await prismaWeb2Client.forumAuditLog.create({
      data: {
        dao_slug: daoSlug as any,
        adminAddress,
        action,
        targetType,
        targetId,
      },
    });
  } catch (error) {
    console.error("Failed to log forum audit action:", error);
  }
}
