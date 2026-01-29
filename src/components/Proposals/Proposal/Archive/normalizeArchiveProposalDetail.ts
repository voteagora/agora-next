import { ArchiveListProposal } from "@/lib/types/archiveProposal";

// Re-export normalization functions from their separate files
export { normalizeArchiveStandardProposal } from "./normalizeArchiveStandardProposal";
export { normalizeArchiveOptimisticProposal } from "./normalizeArchiveOptimisticProposal";
export { normalizeArchiveApprovalProposal } from "./normalizeArchiveApprovalProposal";

export function isArchiveStandardProposal(proposal: ArchiveListProposal) {
  // Check voting_module first (for eas-oodao proposals)
  if (proposal.voting_module) {
    return proposal.voting_module === "standard";
  }
  const moduleName = proposal.voting_module_name;
  return typeof moduleName === "string"
    ? moduleName.toLowerCase() === "standard"
    : true;
}

export function isArchiveOptimisticProposal(proposal: ArchiveListProposal) {
  // Check voting_module first (for eas-oodao proposals)
  if (proposal.voting_module) {
    return proposal.voting_module === "optimistic";
  }
  const moduleName = proposal.voting_module_name;
  return typeof moduleName === "string"
    ? moduleName.toLowerCase() === "optimistic"
    : false;
}

export function isArchiveApprovalProposal(proposal: ArchiveListProposal) {
  // Check voting_module first (for eas-oodao proposals)
  if (proposal.voting_module) {
    return proposal.voting_module === "approval";
  }
  const moduleName = proposal.voting_module_name;
  return typeof moduleName === "string"
    ? moduleName.toLowerCase() === "approval"
    : false;
}
