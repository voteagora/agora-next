import { ForumPermissions } from "@/contexts/ForumPermissionsContext";
import { RelatedItem } from "@/app/create/types";

export function canCreateTempCheck(permissions: ForumPermissions): boolean {
  // User can create temp check if they have topic creation permission (via RBAC or VP)
  return permissions.canCreateTopic;
}

export function canCreateGovernanceProposal(
  _permissions: ForumPermissions,
  relatedTempChecks: RelatedItem[],
  isAuthor: boolean
): boolean {
  const hasApprovedTempCheck =
    Array.isArray(relatedTempChecks) &&
    relatedTempChecks.some((tc) => tc.status === "SUCCEEDED");

  // Author with approved temp check can create governance proposal
  if (isAuthor && hasApprovedTempCheck) return true;

  return false;
}
