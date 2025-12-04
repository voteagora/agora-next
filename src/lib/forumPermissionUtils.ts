import { ForumPermissions } from "@/contexts/ForumPermissionsContext";
import { RelatedItem } from "@/app/create/types";

export function canCreateTempCheck(permissions: ForumPermissions): boolean {
  // User can create temp check if they have topic creation permission (via RBAC or VP)
  if (permissions.canCreateProposal) return true;
  const currentVP = parseInt(permissions.currentVP) || 0;
  const requiredVP = permissions.settings?.minVpForProposals || 0;
  return currentVP >= requiredVP;
}

export function canCreateGovernanceProposal(
  permissions: ForumPermissions,
  relatedTempChecks: RelatedItem[],
  isAuthor: boolean
): boolean {
  const hasApprovedTempCheck =
    Array.isArray(relatedTempChecks) &&
    relatedTempChecks.some((tc) => tc.status === "SUCCEEDED");

  // Author with approved temp check can create governance proposal
  if ((isAuthor || permissions.canCreateProposal) && hasApprovedTempCheck)
    return true;
  return false;
}
