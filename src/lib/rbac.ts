/**
 * RBAC Middleware and Utilities
 * Provides permission checking for agora-next
 */

import { permissionService } from "@/server/services/permission.service";
import { db } from "@/server/db";
import type { DaoSlug } from "@prisma/client";
import verifyMessage from "./serverVerifyMessage";

export interface PermissionCheckParams {
  address: string;
  message: string;
  signature: string;
  daoSlug: DaoSlug;
  module: string;
  resource: string;
  action: string;
}

/**
 * Verify signature and check if user has required permission
 * Throws error if signature invalid or permission denied
 */
export async function requirePermission(
  params: PermissionCheckParams
): Promise<{ address: string; daoSlug: DaoSlug }> {
  const { address, message, signature, daoSlug, module, resource, action } =
    params;

  // Verify signature
  const isValid = await verifyMessage({
    address: address as `0x${string}`,
    message,
    signature: signature as `0x${string}`,
  });

  if (!isValid) {
    throw new Error("Invalid signature");
  }

  // Check permission
  const hasPermission = await permissionService.checkPermission(
    { address: address.toLowerCase(), daoSlug },
    { module, resource, action }
  );

  if (!hasPermission) {
    throw new Error(
      `Insufficient permissions: ${module}.${resource}.${action}`
    );
  }

  return { address: address.toLowerCase(), daoSlug };
}

/**
 * Check if user has a specific permission (without signature verification)
 * Use this for read operations or when signature was already verified
 */
export async function checkPermission(
  address: string,
  daoSlug: DaoSlug,
  module: string,
  resource: string,
  action: string
): Promise<boolean> {
  return permissionService.checkPermission(
    { address: address.toLowerCase(), daoSlug },
    { module, resource, action }
  );
}

/**
 * Check if user has any of the specified permissions
 */
export async function checkAnyPermission(
  address: string,
  daoSlug: DaoSlug,
  permissions: Array<{ module: string; resource: string; action: string }>
): Promise<boolean> {
  return permissionService.hasAnyPermission(
    { address: address.toLowerCase(), daoSlug },
    permissions
  );
}

/**
 * Check if user has all of the specified permissions
 */
export async function checkAllPermissions(
  address: string,
  daoSlug: DaoSlug,
  permissions: Array<{ module: string; resource: string; action: string }>
): Promise<boolean> {
  return permissionService.hasAllPermissions(
    { address: address.toLowerCase(), daoSlug },
    permissions
  );
}

/**
 * Check if user is a super admin (system-wide role)
 * Super admin doesn't require a specific DAO context
 */
export async function requireSuperAdmin(params: {
  address: string;
  message: string;
  signature: string;
}): Promise<{ address: string }> {
  const { address, message, signature } = params;

  // Verify signature
  const isValid = await verifyMessage({
    address: address as `0x${string}`,
    message,
    signature: signature as `0x${string}`,
  });

  if (!isValid) {
    throw new Error("Invalid signature");
  }

  const superAdminRole = await db.forumUserRole.findFirst({
    where: {
      address: address.toLowerCase(),
      daoSlug: null, // System-wide role
      isActive: true,
      revokedAt: null,
      role: {
        slug: "super_admin",
      },
    },
  });

  if (!superAdminRole) {
    throw new Error("Super admin access required");
  }

  return { address: address.toLowerCase() };
}

/**
 * Check if user is a super admin without throwing
 */
export async function isSuperAdmin(address: string): Promise<boolean> {
  return permissionService.isSuperAdmin(address);
}
