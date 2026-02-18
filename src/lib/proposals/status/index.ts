/**
 * Proposal status derivation
 *
 * This module handles deriving the status of archive proposals
 * based on their type, lifecycle events, and vote data.
 */

export { deriveStatus } from "./deriveStatus";
export { deriveOptimisticStatus } from "./optimistic";
export { deriveApprovalStatus } from "./approval";
export { deriveStandardStatus } from "./standard";
