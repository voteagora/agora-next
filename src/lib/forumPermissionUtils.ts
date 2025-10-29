import { ForumPermissions } from "@/contexts/ForumPermissionsContext";
import { RelatedItem } from "@/app/create/types";

export function canCreateTempCheck(permissions: ForumPermissions): boolean {
  if (permissions.isAdmin) return true;

  const currentVP = parseInt(permissions.currentVP) || 0;
  const requiredVP = permissions.settings?.minVpForProposals || 0;
  return currentVP >= requiredVP;
}

export function canCreateGovernanceProposal(
  permissions: ForumPermissions,
  relatedTempChecks: RelatedItem[]
): boolean {
  const hasApprovedTempCheck = Array.isArray(relatedTempChecks) && relatedTempChecks.some(
    (tc) => tc.status === "SUCCEEDED"
  );

  if (!hasApprovedTempCheck) return false;
  if (permissions.isAdmin) return true;

  const currentVP = parseInt(permissions.currentVP) || 0;
  const requiredVP = permissions.settings?.minVpForProposals || 0;
  return currentVP >= requiredVP;
}
