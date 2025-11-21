"use server";

import Tenant from "@/lib/tenant/tenant";
import { getForumCategory } from "./categories";
import { prismaWeb2Client } from "@/app/lib/prisma";

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
  categoryId?: number
) {
  try {
    const { slug } = Tenant.current();

    // Check RBAC permissions
    const rbacUser = await prismaWeb2Client.forumUserRole.findFirst({
      where: {
        address: address.toLowerCase(),
        OR: [
          { daoSlug: slug as any }, // DAO-specific roles
          { daoSlug: null }, // System-wide roles (Super Admin)
        ],
        isActive: true,
        revokedAt: null,
      },
      include: {
        role: true,
      },
    });

    const isAdmin = !!rbacUser;

    // If admin, grant all permissions
    if (isAdmin) {
      return {
        isAdmin: true,
        canCreateTopics: true,
        canManageTopics: true,
        canCreateAttachments: true,
        canManageAttachments: true,
      };
    }

    // Check legacy forum permissions (for non-admins)
    const permissions = await prismaWeb2Client.forumPermission.findMany({
      where: {
        dao_slug: slug,
        address: address.toLowerCase(),
        OR: [
          { scope: "forum", scopeId: null },
          ...(categoryId
            ? [{ scope: "category" as any, scopeId: categoryId }]
            : []),
        ],
      },
    });

    const permissionTypes = permissions.map((p) => p.permissionType);

    // Check category restrictions
    let canCreateTopics = true;
    if (categoryId) {
      const response = await getForumCategory(categoryId);
      const category = response?.success ? response.data : null;
      canCreateTopics =
        !category?.adminOnlyTopics || permissionTypes.includes("create_topics");
    }

    return {
      isAdmin: false,
      canCreateTopics,
      canManageTopics: permissionTypes.includes("manage_topics"),
      canCreateAttachments: permissionTypes.includes("create_attachments"),
      canManageAttachments: permissionTypes.includes("manage_attachments"),
    };
  } catch (error) {
    console.error("Error checking forum permissions:", error);
    return {
      isAdmin: false,
      canCreateTopics: false,
      canManageTopics: false,
      canCreateAttachments: false,
      canManageAttachments: false,
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
