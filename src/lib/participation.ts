import { TENANT_PROPOSAL_SOURCES } from "@/lib/constants";
import type { TenantNamespace } from "@/lib/types";
import type { ArchiveListProposal } from "@/lib/types/archiveProposal";
import { deriveProposalType } from "@/lib/types/archiveProposal";

export type ParticipationSource = "dao-node" | "archive-eas-oodao" | "none";

export function getParticipationSource(
  namespace: TenantNamespace,
  options: { hasEasOodao?: boolean } = {}
): ParticipationSource {
  const sources = TENANT_PROPOSAL_SOURCES[namespace] ?? [];

  if (options.hasEasOodao) {
    return "archive-eas-oodao";
  }

  if (sources.includes("eas-oodao") && !sources.includes("dao-node")) {
    return "archive-eas-oodao";
  }

  if (sources.includes("dao-node")) {
    return "dao-node";
  }

  return "none";
}

export function isEligibleArchiveParticipationProposal(
  proposal: ArchiveListProposal
) {
  if (
    proposal.cancel_event ||
    proposal.delete_event ||
    proposal.lifecycle_stage === "CANCELLED"
  ) {
    return false;
  }

  return !deriveProposalType(proposal).includes("OPTIMISTIC");
}
