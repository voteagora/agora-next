"use server";

import Tenant from "@/lib/tenant/tenant";
import { prismaWeb2Client } from "@/app/lib/prisma";
import { checkPermission, isSuperAdmin } from "@/lib/rbac";
import type { DaoSlug } from "@prisma/client";

/**
 * Get forum admins using RBAC system
 * Returns users with active roles in the current DAO
 */
export async function getForumAdmins() {
  try {
    const { slug } = Tenant.current();

    // Fetch users with active roles for this DAO
    const userRoles = await prismaWeb2Client.forumUserRole.findMany({
      where: {
        daoSlug: slug as DaoSlug,
        isActive: true,
        revokedAt: null,
      },
      include: {
        role: {
          select: {
            slug: true,
            name: true,
          },
        },
      },
      orderBy: {
        address: "asc",
      },
    });

    // Group by address and determine highest role
    const adminMap = new Map<string, { address: string; role: string }>();

    for (const userRole of userRoles) {
      const address = userRole.address.toLowerCase();
      const roleSlug = userRole.role.slug;

      // Map RBAC roles to legacy role format for compatibility
      let legacyRole = "admin";
      if (roleSlug === "duna_admin") {
        legacyRole = "duna_admin";
      }

      // Keep highest role (duna_admin > admin)
      const existing = adminMap.get(address);
      if (!existing || legacyRole !== "duna_admin") {
        adminMap.set(address, { address, role: legacyRole });
      }
    }

    return {
      success: true as const,
      data: Array.from(adminMap.values()),
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
