import { ForumPermissions } from "@/contexts/ForumPermissionsContext";

export function canCreateTempCheck(permissions: ForumPermissions): boolean {
  if (permissions.isAdmin) return true;

  const currentVP = parseInt(permissions.currentVP) || 0;
  const requiredVP = permissions.settings?.minVpForProposals || 0;
  return currentVP >= requiredVP;
}

export function canCreateGovernanceProposal(
  permissions: ForumPermissions,
  hasRelatedTempChecks: boolean
): boolean {
  if (!hasRelatedTempChecks) return false;
  if (permissions.isAdmin) return true;

  const currentVP = parseInt(permissions.currentVP) || 0;
  const requiredVP = permissions.settings?.minVpForProposals || 0;
  return currentVP >= requiredVP;
}
