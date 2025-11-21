/**
 * Shared types for RBAC services
 */

import type { DaoSlug } from "@prisma/client";

export interface PermissionCheck {
  module: string;
  resource: string;
  action: string;
}

export interface PermissionContext {
  address: string;
  daoSlug: DaoSlug | null; // null for system-wide permission checks
}

export interface UserPermission {
  id: number;
  module: string;
  resource: string;
  action: string;
  description: string | null;
  conditions?: Record<string, unknown> | null;
  roleId: number;
  roleName: string;
}

export interface RoleWithPermissions {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  daoSlug: DaoSlug | null; // null for system-wide roles
  isSystem: boolean;
  isDefault: boolean;
  permissions: Array<{
    id: number;
    module: string;
    resource: string;
    action: string;
    description: string | null;
    conditions?: Record<string, unknown> | null;
  }>;
}

export interface AuditLogEntry {
  daoSlug: DaoSlug | null; // null for system-wide operations
  action: string;
  actor: string;
  targetUser?: string;
  roleId?: number;
  roleName?: string;
  permissionChanges?: Record<string, unknown>;
  context?: Record<string, unknown>;
}
