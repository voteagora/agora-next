/**
 * Permission Service
 * Handles permission checking and user permission queries
 */

import { db } from "../db";
import { normalizeAddress } from "../utils/address";
import type {
  PermissionCheck,
  PermissionContext,
  UserPermission,
} from "./types";
import type { DaoSlug } from "@prisma/client";

export class PermissionService {
  /**
   * Check if a user has a specific permission
   */
  async checkPermission(
    context: PermissionContext,
    permission: PermissionCheck
  ): Promise<boolean> {
    const { address, daoSlug } = context;
    const normalizedAddress = normalizeAddress(address);
    const { module, resource, action } = permission;

    // Get user's active roles for the DAO
    // Include BOTH:
    // 1. DAO-specific roles (daoSlug matches)
    // 2. System-wide roles (daoSlug is null) - e.g., Super Admin
    const userRoles = await db.forumUserRole.findMany({
      where: {
        address: normalizedAddress,
        OR: [
          { daoSlug }, // DAO-specific roles
          { daoSlug: null }, // System-wide roles (Super Admin)
        ],
        isActive: true,
        revokedAt: null,
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    // Check if any of the user's roles have the required permission
    for (const userRole of userRoles) {
      const hasPermission = userRole.role.rolePermissions.some((rp) => {
        const perm = rp.permission;
        return (
          perm.module === module &&
          perm.resource === resource &&
          perm.action === action
        );
      });
      if (hasPermission) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(
    context: PermissionContext,
    permissions: PermissionCheck[]
  ): Promise<boolean> {
    for (const permission of permissions) {
      const hasPermission = await this.checkPermission(context, permission);
      if (hasPermission) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if user has all of the specified permissions
   */
  async hasAllPermissions(
    context: PermissionContext,
    permissions: PermissionCheck[]
  ): Promise<boolean> {
    for (const permission of permissions) {
      const hasPermission = await this.checkPermission(context, permission);
      if (!hasPermission) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get all permissions for a user in a specific DAO
   * Includes both DAO-specific roles and system-wide roles (Super Admin)
   */
  async getUserPermissions(
    address: string,
    daoSlug: DaoSlug
  ): Promise<UserPermission[]> {
    const normalizedAddress = normalizeAddress(address);

    // Get user's active roles
    // Include BOTH:
    // 1. DAO-specific roles (daoSlug matches)
    // 2. System-wide roles (daoSlug is null) - e.g., Super Admin
    const userRoles = await db.forumUserRole.findMany({
      where: {
        address: normalizedAddress,
        OR: [
          { daoSlug }, // DAO-specific roles
          { daoSlug: null }, // System-wide roles (Super Admin)
        ],
        isActive: true,
        revokedAt: null,
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const permissions: UserPermission[] = [];
    const seen = new Set<string>();

    for (const userRole of userRoles) {
      for (const rp of userRole.role.rolePermissions) {
        const key = `${rp.permission.module}.${rp.permission.resource}.${rp.permission.action}`;

        // Deduplicate permissions
        if (!seen.has(key)) {
          seen.add(key);
          permissions.push({
            id: rp.permission.id,
            module: rp.permission.module,
            resource: rp.permission.resource,
            action: rp.permission.action,
            description: rp.permission.description,
            conditions: rp.conditions as Record<string, unknown> | null,
            roleId: userRole.role.id,
            roleName: userRole.role.name,
          });
        }
      }
    }

    return permissions;
  }

  /**
   * Get permission matrix (all permissions grouped by module and resource)
   */
  async getPermissionMatrix() {
    const permissions = await db.forumPermission.findMany({
      orderBy: [{ module: "asc" }, { resource: "asc" }, { action: "asc" }],
    });

    // Group by module -> resource -> actions
    const matrix: Record<
      string,
      Record<string, Array<{ action: string; description: string | null }>>
    > = {};

    for (const permission of permissions) {
      if (!matrix[permission.module]) {
        matrix[permission.module] = {};
      }
      if (!matrix[permission.module]![permission.resource]) {
        matrix[permission.module]![permission.resource] = [];
      }
      matrix[permission.module]![permission.resource]!.push({
        action: permission.action,
        description: permission.description,
      });
    }

    return matrix;
  }

  /**
   * Check if user is a super admin (system-wide role with daoSlug = null)
   */
  async isSuperAdmin(address: string): Promise<boolean> {
    const normalizedAddress = address.toLowerCase();
    const superAdminRole = await db.forumUserRole.findFirst({
      where: {
        address: normalizedAddress,
        daoSlug: null, // System-wide role
        isActive: true,
        revokedAt: null,
        role: {
          slug: "super_admin",
        },
      },
    });

    return !!superAdminRole;
  }
}

// Export singleton instance
export const permissionService = new PermissionService();
