/**
 * PermissionGate Component
 * Declarative permission-based UI rendering
 * Hides children if user lacks required permissions
 */

"use client";

import React from "react";
import {
  useHasPermission,
  useHasAnyPermission,
  useHasAllPermissions,
} from "@/hooks/useRbacPermissions";
import type { DaoSlug } from "@prisma/client";

interface BasePermissionGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLoading?: boolean;
  loadingContent?: React.ReactNode;
  address?: string;
  daoSlug?: DaoSlug;
}

interface SinglePermissionProps extends BasePermissionGateProps {
  module: string;
  resource: string;
  action: string;
  requireAny?: never;
  requireAll?: never;
}

interface RequireAnyProps extends BasePermissionGateProps {
  module?: never;
  resource?: never;
  action?: never;
  requireAny: Array<{ module: string; resource: string; action: string }>;
  requireAll?: never;
}

interface RequireAllProps extends BasePermissionGateProps {
  module?: never;
  resource?: never;
  action?: never;
  requireAny?: never;
  requireAll: Array<{ module: string; resource: string; action: string }>;
}

type PermissionGateProps =
  | SinglePermissionProps
  | RequireAnyProps
  | RequireAllProps;

/**
 * PermissionGate - Show/hide UI based on user permissions
 *
 * @example Single permission
 * ```tsx
 * <PermissionGate module="forums" resource="topics" action="delete">
 *   <DeleteButton />
 * </PermissionGate>
 * ```
 *
 * @example Any permission (OR logic)
 * ```tsx
 * <PermissionGate
 *   requireAny={[
 *     { module: "forums", resource: "topics", action: "create" },
 *     { module: "forums", resource: "topics", action: "update" }
 *   ]}
 * >
 *   <TopicForm />
 * </PermissionGate>
 * ```
 *
 * @example All permissions (AND logic)
 * ```tsx
 * <PermissionGate
 *   requireAll={[
 *     { module: "system", resource: "roles", action: "read" },
 *     { module: "system", resource: "users", action: "update" }
 *   ]}
 * >
 *   <AdminPanel />
 * </PermissionGate>
 * ```
 *
 * @example With fallback content
 * ```tsx
 * <PermissionGate
 *   module="forums"
 *   resource="topics"
 *   action="delete"
 *   fallback={<p>You don't have permission to delete topics</p>}
 * >
 *   <DeleteButton />
 * </PermissionGate>
 * ```
 */
export function PermissionGate(props: PermissionGateProps) {
  const {
    children,
    fallback = null,
    showLoading = false,
    loadingContent = null,
    address,
    daoSlug,
  } = props;

  // Call all hooks unconditionally (React rules of hooks)
  const singlePermResult = useHasPermission(
    "module" in props && props.module ? props.module : "",
    "resource" in props && props.resource ? props.resource : "",
    "action" in props && props.action ? props.action : "",
    address,
    daoSlug
  );

  const anyPermResult = useHasAnyPermission(
    "requireAny" in props && props.requireAny ? props.requireAny : [],
    address,
    daoSlug
  );

  const allPermResult = useHasAllPermissions(
    "requireAll" in props && props.requireAll ? props.requireAll : [],
    address,
    daoSlug
  );

  // Determine which result to use based on props
  let hasPermission = false;
  let isLoading = false;

  if ("module" in props && props.module) {
    hasPermission = singlePermResult.hasPermission;
    isLoading = singlePermResult.isLoading;
  } else if ("requireAny" in props && props.requireAny) {
    hasPermission = anyPermResult.hasPermission;
    isLoading = anyPermResult.isLoading;
  } else if ("requireAll" in props && props.requireAll) {
    hasPermission = allPermResult.hasPermission;
    isLoading = allPermResult.isLoading;
  }

  // Show loading state if requested
  if (isLoading && showLoading) {
    return <>{loadingContent}</>;
  }

  // Show children if user has permission, otherwise show fallback
  return <>{hasPermission ? children : fallback}</>;
}

/**
 * InversePermissionGate - Show content ONLY if user LACKS permission
 * Useful for showing "upgrade" messages or locked features
 *
 * @example
 * ```tsx
 * <InversePermissionGate module="forums" resource="topics" action="delete">
 *   <p>You need admin permissions to delete topics</p>
 * </InversePermissionGate>
 * ```
 */
export function InversePermissionGate(props: PermissionGateProps) {
  const {
    children,
    fallback = null,
    showLoading = false,
    loadingContent = null,
    address,
    daoSlug,
  } = props;

  // Call all hooks unconditionally (React rules of hooks)
  const singlePermResult = useHasPermission(
    "module" in props && props.module ? props.module : "",
    "resource" in props && props.resource ? props.resource : "",
    "action" in props && props.action ? props.action : "",
    address,
    daoSlug
  );

  const anyPermResult = useHasAnyPermission(
    "requireAny" in props && props.requireAny ? props.requireAny : [],
    address,
    daoSlug
  );

  const allPermResult = useHasAllPermissions(
    "requireAll" in props && props.requireAll ? props.requireAll : [],
    address,
    daoSlug
  );

  // Determine which result to use based on props
  let hasPermission = false;
  let isLoading = false;

  if ("module" in props && props.module) {
    hasPermission = singlePermResult.hasPermission;
    isLoading = singlePermResult.isLoading;
  } else if ("requireAny" in props && props.requireAny) {
    hasPermission = anyPermResult.hasPermission;
    isLoading = anyPermResult.isLoading;
  } else if ("requireAll" in props && props.requireAll) {
    hasPermission = allPermResult.hasPermission;
    isLoading = allPermResult.isLoading;
  }

  if (isLoading && showLoading) {
    return <>{loadingContent}</>;
  }

  // Inverse logic: show children if user LACKS permission
  return <>{!hasPermission ? children : fallback}</>;
}
