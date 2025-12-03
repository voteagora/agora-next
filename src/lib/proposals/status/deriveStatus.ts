import {
  ArchiveListProposal,
  deriveProposalType,
} from "@/lib/types/archiveProposal";
import { deriveOptimisticStatus } from "./optimistic";
import { deriveApprovalStatus } from "./approval";
import { deriveStandardStatus } from "./standard";

const TEN_DAYS_IN_SECONDS = 10 * 24 * 60 * 60;

/**
 * Derive the status of an archive proposal
 *
 * Status derivation order:
 * 1. Terminal states (CANCELLED, EXECUTED, QUEUED/PASSED)
 * 2. Time-based states (PENDING, ACTIVE)
 * 3. Vote-based states (delegated to type-specific handlers)
 */
export const deriveStatus = (
  proposal: ArchiveListProposal,
  decimals: number
): string => {
  // Check terminal states first
  if (proposal.cancel_event || proposal.lifecycle_stage === "CANCELLED") {
    return "CANCELLED";
  } else if (proposal.execute_event) {
    return "EXECUTED";
  } else if (proposal.queue_event) {
    const queueEvent = proposal.queue_event;
    const queueTimestamp = Number(
      queueEvent?.timestamp ?? queueEvent?.blocktime ?? 0
    );
    // Check for no onchain actions (calldatas empty or all zeros)
    const hasNoOnchainActions =
      !proposal.calldatas ||
      proposal.calldatas.length === 0 ||
      proposal.calldatas.every((c) => c === "0x" || c === "");
    if (
      queueTimestamp > 0 &&
      Math.floor(Date.now() / 1000) - queueTimestamp > TEN_DAYS_IN_SECONDS &&
      hasNoOnchainActions
    ) {
      return "PASSED";
    }
    return "QUEUED";
  }

  // Check if proposal is still active or pending
  const now = Math.floor(Date.now() / 1000);
  const startTime = Number(proposal.start_blocktime) || 0;
  const endTime = Number(proposal.end_blocktime) || 0;

  if (startTime > now) {
    return "PENDING";
  }
  if (endTime > now) {
    return "ACTIVE";
  }

  const proposalType = deriveProposalType(proposal);

  // Handle OPTIMISTIC variants (pass unless vetoed)
  if (proposalType.includes("OPTIMISTIC")) {
    return deriveOptimisticStatus(proposal, proposalType, decimals);
  }

  // Handle APPROVAL variants
  if (proposalType.includes("APPROVAL")) {
    return deriveApprovalStatus(proposal, proposalType, decimals);
  }

  // Handle STANDARD variants (including HYBRID_STANDARD, OFFCHAIN_STANDARD)
  return deriveStandardStatus(proposal, proposalType, decimals);
};
