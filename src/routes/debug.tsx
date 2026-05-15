/*
 * TanStack Start port of src/app/debug/page.tsx.
 * URL: /debug
 */

import { createFileRoute } from "@tanstack/react-router";

import TenantDebugPage from "@/app/debug/page";

export const Route = createFileRoute("/debug")({
  component: TenantDebugPage,
});
