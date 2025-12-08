/**
 * RBAC Permission Hooks
 * React Query hooks for permission checking
 */

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import type { DaoSlug } from "@prisma/client";

interface Permission {
  id: number;
  module: string;
  resource: string;
  action: string;
  description: string | null;
  conditions?: Record<string, unknown> | null;
  roleId: number;
  roleName: string;
}

interface UserPermissionsResponse {
  address: string;
  daoSlug: DaoSlug;
  permissions: Permission[];
}

/**
 * Fetch user's permissions for a specific DAO
 * Includes both DAO-specific and system-wide roles (Super Admin)
 */
export function useUserPermissions(address?: string, daoSlug?: DaoSlug) {
  const { address: connectedAddress } = useAccount();
  const { slug: currentDaoSlug } = Tenant.current();

  const userAddress = address || connectedAddress;
  const targetDaoSlug = daoSlug || (currentDaoSlug as DaoSlug);

  return useQuery({
    queryKey: ["rbac", "userPermissions", userAddress, targetDaoSlug],
    queryFn: async (): Promise<UserPermissionsResponse> => {
      if (!userAddress || !targetDaoSlug) {
        throw new Error("Address and DAO slug required");
      }

      const response = await fetch(
        `/api/rbac/permissions/me?address=${userAddress}&daoSlug=${targetDaoSlug}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch permissions");
      }

      return response.json();
    },
    enabled: !!userAddress && !!targetDaoSlug,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 1,
  });
}

/**
 * Check if user has a specific permission
 * Returns a boolean and loading state
 */
export function useHasPermission(
  module: string,
  resource: string,
  action: string,
  address?: string,
  daoSlug?: DaoSlug
) {
  const { data, isLoading } = useUserPermissions(address, daoSlug);

  const hasPermission =
    data?.permissions.some(
      (p) =>
        p.module === module && p.resource === resource && p.action === action
    ) ?? false;

  return {
    hasPermission,
    isLoading,
    permissions: data?.permissions || [],
  };
}

/**
 * Check if user has ANY of the specified permissions (OR logic)
 */
export function useHasAnyPermission(
  permissions: Array<{ module: string; resource: string; action: string }>,
  address?: string,
  daoSlug?: DaoSlug
) {
  const { data, isLoading } = useUserPermissions(address, daoSlug);

  const hasAnyPermission =
    permissions.some((required) =>
      data?.permissions.some(
        (p) =>
          p.module === required.module &&
          p.resource === required.resource &&
          p.action === required.action
      )
    ) ?? false;

  return {
    hasPermission: hasAnyPermission,
    isLoading,
    permissions: data?.permissions || [],
  };
}

/**
 * Check if user has ALL of the specified permissions (AND logic)
 */
export function useHasAllPermissions(
  permissions: Array<{ module: string; resource: string; action: string }>,
  address?: string,
  daoSlug?: DaoSlug
) {
  const { data, isLoading } = useUserPermissions(address, daoSlug);

  const hasAllPermissions =
    permissions.every((required) =>
      data?.permissions.some(
        (p) =>
          p.module === required.module &&
          p.resource === required.resource &&
          p.action === required.action
      )
    ) ?? false;

  return {
    hasPermission: hasAllPermissions,
    isLoading,
    permissions: data?.permissions || [],
  };
}

/**
 * Check if user is a super admin (system-wide role)
 */
export function useIsSuperAdmin(address?: string) {
  const { address: connectedAddress } = useAccount();
  const userAddress = address || connectedAddress;

  return useQuery({
    queryKey: ["rbac", "isSuperAdmin", userAddress],
    queryFn: async (): Promise<boolean> => {
      if (!userAddress) {
        return false;
      }

      const response = await fetch(
        `/api/rbac/super-admin/check?address=${userAddress}`
      );

      if (!response.ok) {
        throw new Error("Failed to check super admin status");
      }

      const data = await response.json();
      return data.isSuperAdmin;
    },
    enabled: !!userAddress,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,
    retry: 1,
    placeholderData: false, // Default to false
  });
}

/**
 * Get all permissions grouped by module
 * Useful for displaying permission matrices or admin panels
 */
export function usePermissionsByModule(address?: string, daoSlug?: DaoSlug) {
  const { data, isLoading } = useUserPermissions(address, daoSlug);

  const permissionsByModule =
    data?.permissions.reduce(
      (acc, permission) => {
        if (!acc[permission.module]) {
          acc[permission.module] = [];
        }
        acc[permission.module]!.push(permission);
        return acc;
      },
      {} as Record<string, Permission[]>
    ) || {};

  return {
    permissionsByModule,
    isLoading,
    allPermissions: data?.permissions || [],
  };
}
