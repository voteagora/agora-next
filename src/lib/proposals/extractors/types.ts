/**
 * Shared types for proposal vote extractors
 */

import type {
  ArchiveListProposal,
  ArchiveProposalBySource,
} from "@/lib/types/archiveProposal";

// =============================================================================
// Vote Data Types
// =============================================================================

/** Raw vote counts (numbers, already converted from wei) */
export type VoteData = {
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
};

/** Raw vote strings (wei values, for display formatting) */
export type RawVoteData = {
  forRaw: string;
  againstRaw: string;
  abstainRaw: string;
};

/** Combined vote data */
export type VoteDataWithRaw = VoteData & RawVoteData;

// =============================================================================
// Standard Metrics
// =============================================================================

export type StandardVoteSegments = {
  forPercentage: number;
  againstPercentage: number;
  abstainPercentage: number;
};

export type StandardMetrics = VoteDataWithRaw & {
  segments: StandardVoteSegments;
  hasVotes: boolean;
};

// =============================================================================
// Approval Metrics
// =============================================================================

export type ApprovalChoice = {
  index: number;
  text: string;
  approvals: number;
  percentage: number;
};

export type ApprovalOption = {
  targets: string[];
  values: string[];
  calldatas: string[];
  description: string;
  budgetTokensSpent: bigint | null;
};

export type ApprovalMetrics = {
  choices: ApprovalChoice[];
  maxApprovals: number;
  criteria: number;
  criteriaValue: bigint;
  budgetToken: string;
  budgetAmount: bigint;
  totalVoters?: number;
  options: ApprovalOption[];
};

// =============================================================================
// Optimistic Metrics
// =============================================================================

export type OptimisticMetrics = {
  againstCount: number;
  againstPercentage: number;
  defeatThreshold: number;
  isDefeated: boolean;
};

export type OptimisticTieredMetrics = {
  againstCount: number;
  supportCount: number;
  againstPercentage: number;
  tiers: number[];
  currentTier: number;
  isDefeated: boolean;
};

// =============================================================================
// Input Type
// =============================================================================

/**
 * Union of proposal types that extractors accept.
 * Supports both the discriminated union and legacy type.
 */
export type ArchiveProposalInput =
  | ArchiveProposalBySource
  | ArchiveListProposal;

// =============================================================================
// Extractor Options
// =============================================================================

export type ExtractorOptions = {
  tokenDecimals: number;
};
