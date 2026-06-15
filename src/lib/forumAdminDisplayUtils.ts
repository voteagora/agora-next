import { ADMIN_TYPES } from "@/lib/constants";
import { isCivicDemoEnabled } from "@/mocks/civicDemoProposals";

export function getForumSidebarAdminLabel(): string {
  return isCivicDemoEnabled() ? "CIVIC Exec" : "Official DUNA Admin";
}

export function getForumSidebarAdminBadgeType(): string {
  return isCivicDemoEnabled() ? "CIVIC_EXEC" : "ADMIN";
}

export function getForumAdminBadgeType(
  role: string | null | undefined
): string {
  if (isCivicDemoEnabled()) {
    if (role === "civic_exec" || role === "admin") {
      return "CIVIC_EXEC";
    }
  }

  return role ? (ADMIN_TYPES[role] ?? "Admin") : "Admin";
}
