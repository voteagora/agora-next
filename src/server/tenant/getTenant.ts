/*
 * Server-fn surface for Tenant data, used by TanStack Start routes that need
 * to make tenant-dependent decisions in `loader`/`beforeLoad` (where the code
 * may also run client-side on navigation — `Tenant.current()` is Node-only).
 *
 * Grow this file as more Tenant fields are needed in the loader layer.
 */

import { createServerFn } from "@tanstack/react-start";

import Tenant from "@/lib/tenant/tenant";

export const getTenantNotificationsContext = createServerFn({
  method: "GET",
}).handler(async () => {
  const { brandName, ui } = Tenant.current();
  return {
    brandName,
    notificationsEnabled: ui.toggle("notifications")?.enabled ?? false,
  };
});
