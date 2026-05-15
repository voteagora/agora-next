/*
 * TanStack Start port of src/app/admin/membership/page.tsx.
 * URL: /admin/membership
 * Pure client component, no server data needed.
 */

import { createFileRoute } from "@tanstack/react-router";

import AdminMembershipPage from "@/app/admin/membership/page";

export const Route = createFileRoute("/admin/membership")({
  component: AdminMembershipPage,
});
