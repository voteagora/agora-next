/**
 * RBAC Permission Hooks
 * React Query hooks for permission checking
 */

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import type { DaoSlug } from "@prisma/client";
import { useSiweJwt } from "./useSiweJwt";

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

interface PermissionHookOptions {
  address?: string;
  daoSlug?: DaoSlug;
  autoAuthenticate?: boolean;
}

/**
 * Fetch user's permissions for a specific DAO
 * Includes both DAO-specific and system-wide roles (Super Admin)
 */
export function useUserPermissions(options: PermissionHookOptions = {}) {
  const { address: connectedAddress } = useAccount();
  const { slug: currentDaoSlug } = Tenant.current();

  const userAddress = options.address || connectedAddress;
  const targetDaoSlug = options.daoSlug || (currentDaoSlug as DaoSlug);
  const normalizedUserAddress = userAddress?.toLowerCase();
  const normalizedConnectedAddress = connectedAddress?.toLowerCase();
  const isSelfLookup =
    !!normalizedUserAddress &&
    !!normalizedConnectedAddress &&
    normalizedUserAddress === normalizedConnectedAddress;
  const {
    jwt: siweJwt,
    isSigningIn,
    clearSession,
  } = useSiweJwt({
    expectedAddress: normalizedUserAddress,
    autoAuthenticate: options.autoAuthenticate && isSelfLookup,
  });
  const authInitialized = !normalizedUserAddress || siweJwt !== undefined;

  const query = useQuery({
    queryKey: [
      "rbac",
      "userPermissions",
      normalizedUserAddress,
      targetDaoSlug,
      Boolean(siweJwt),
    ],
    queryFn: async (): Promise<UserPermissionsResponse> => {
      if (!normalizedUserAddress || !targetDaoSlug) {
        throw new Error("Address and DAO slug required");
      }

      if (!isSelfLookup || !siweJwt) {
        return {
          address: normalizedUserAddress,
          daoSlug: targetDaoSlug,
          permissions: [],
        };
      }

      const response = await fetch(
        `/api/rbac/permissions/me?daoSlug=${targetDaoSlug}`,
        {
          headers: {
            Authorization: `Bearer ${siweJwt}`,
          },
        }
      );

      if (response.status === 401) {
        await clearSession();
      }

      if (!response.ok) {
        throw new Error("Failed to fetch permissions");
      }

      return response.json();
    },
    enabled: !!normalizedUserAddress && !!targetDaoSlug && authInitialized,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  return {
    ...query,
    isLoading:
      query.isLoading ||
      (!!normalizedUserAddress && !authInitialized) ||
      isSigningIn,
  };
}

/**
 * Check if user has a specific permission
 */
export function useHasPermission(
  module: string,
  resource: string,
  action: string,
  options?: PermissionHookOptions
) {
  const { data, isLoading } = useUserPermissions(options);

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
  options?: PermissionHookOptions
) {
  const { data, isLoading } = useUserPermissions(options);

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
  options?: PermissionHookOptions
) {
  const { data, isLoading } = useUserPermissions(options);

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
export function useIsSuperAdmin(options: PermissionHookOptions = {}) {
  const { address: connectedAddress } = useAccount();
  const userAddress = options.address || connectedAddress;
  const normalizedUserAddress = userAddress?.toLowerCase();
  const normalizedConnectedAddress = connectedAddress?.toLowerCase();
  const isSelfLookup =
    !!normalizedUserAddress &&
    !!normalizedConnectedAddress &&
    normalizedUserAddress === normalizedConnectedAddress;
  const {
    jwt: siweJwt,
    isSigningIn,
    clearSession,
  } = useSiweJwt({
    expectedAddress: normalizedUserAddress,
    autoAuthenticate: options.autoAuthenticate && isSelfLookup,
  });
  const authInitialized = !normalizedUserAddress || siweJwt !== undefined;

  const query = useQuery({
    queryKey: ["rbac", "isSuperAdmin", normalizedUserAddress, Boolean(siweJwt)],
    queryFn: async (): Promise<boolean> => {
      if (!normalizedUserAddress) {
        return false;
      }

      if (!isSelfLookup || !siweJwt) {
        return false;
      }

      const response = await fetch(`/api/rbac/super-admin/check`, {
        headers: {
          Authorization: `Bearer ${siweJwt}`,
        },
      });

      if (response.status === 401) {
        await clearSession();
      }

      if (!response.ok) {
        throw new Error("Failed to check super admin status");
      }

      const data = await response.json();
      return data.isSuperAdmin;
    },
    enabled: !!normalizedUserAddress && authInitialized,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    placeholderData: false,
  });

  return {
    ...query,
    isLoading:
      query.isLoading ||
      (!!normalizedUserAddress && !authInitialized) ||
      isSigningIn,
  };
}

/**
 * Get all permissions grouped by module
 */
export function usePermissionsByModule(options?: PermissionHookOptions) {
  const { data, isLoading } = useUserPermissions(options);

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
