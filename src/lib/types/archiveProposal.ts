/**
 * Type definitions for archive proposals from NDJSON format
 *
 * Sources:
 * - dao_node: Onchain proposals from the DAO governor contract
 * - eas-atlas: EAS-based proposals for OP citizen voting (Atlas)
 * - eas-oodao: EAS-based generic DAO proposals (e.g., Syndicate)
 *
 * Proposal Classification:
 * - STANDARD: Simple for/against/abstain voting
 * - APPROVAL: Multi-choice approval voting with choices array
 * - OPTIMISTIC: Optimistic proposals that pass unless vetoed
 * - OPTIMISTIC_TIERED: Optimistic with tier-based thresholds
 * - HYBRID_*: Onchain proposal with linked offchain voting (govless_proposal)
 * - OFFCHAIN_*: Purely offchain EAS-based proposals
 */

import type { ProposalType } from "@/lib/types";

export type DecodedStandardProposalData = {
  functionArgsName?: {
    functionName: string;
    functionArgs: string[];
  }[];
};

// =============================================================================
// Data Source Types
// =============================================================================

export type ArchiveDataSource = "dao_node" | "eas-atlas" | "eas-oodao";

export type DataEngProperties = {
  liveness: "live" | "archived";
  source: ArchiveDataSource | string;
  hash?: string; // Present in eas-atlas
};

// =============================================================================
// Proposal Class (base voting mechanism)
// =============================================================================

export type ProposalClass = "STANDARD" | "OPTIMISTIC" | "APPROVAL";

// =============================================================================
// Lifecycle Events
// =============================================================================

export type ArchiveProposalEvent = {
  block_number?: string;
  transaction_index?: number;
  log_index?: number;
  id?: string;
  timestamp?: number;
  blocktime?: number;
  eta?: number;
  transaction_hash?: string;
};

export type ArchiveProposalDeleteEvent = {
  transaction_hash: string;
  dao_id: string;
  uid: string;
  deleter: string;
  chain_id: number;
  ref_uid: string;
  attestation_time: number;
};

// =============================================================================
// Proposal Type Configuration (eas-oodao specific)
// =============================================================================

/** Fixed proposal type with EAS attestation (eas-oodao) */
export type FixedProposalType = {
  eas_uid: string;
  name: string;
  class: ProposalClass;
  quorum: number; // basis points (e.g., 3000 = 30%)
  description: string;
  approval_threshold: number; // basis points (e.g., 5000 = 50%)
};

/** Range-based proposal type configuration (eas-oodao) */
export type RangeProposalType = {
  min_quorum_pct: number;
  max_quorum_pct: number;
  min_approval_threshold_pct: number;
  max_approval_threshold_pct: number;
};

// =============================================================================
// Vote Outcome Types
// =============================================================================

/** Vote totals for dao_node (onchain) - keyed by choice index or "no-param" */
export type DaoNodeVoteTotals = {
  ["no-param"]: {
    "0"?: string; // against votes (wei)
    "1"?: string; // for votes (wei)
    "2"?: string; // abstain votes (wei)
  };
};

/** Vote outcome for eas-atlas - keyed by voter category (USER, APP, CHAIN) */
export type EasAtlasVoteOutcome = {
  USER?: { [choiceIndex: string]: number | { "1": number } };
  APP?: { [choiceIndex: string]: number | { "1": number } };
  CHAIN?: { [choiceIndex: string]: number | { "1": number } };
};

/** Vote outcome for eas-oodao - keyed by "token-holders" */
export type EasOodaoVoteOutcome = {
  "token-holders": {
    "0"?: string; // against votes (wei)
    "1"?: string; // for votes (wei)
    "2"?: string; // abstain votes (wei)
  };
};

// =============================================================================
// Base Proposal Fields (common to all sources)
// =============================================================================

export type ArchiveProposalBase = {
  id: string;
  title: string;
  proposer: string;
  proposer_ens: string | null | { detail?: string };
  start_blocktime: number;
  end_blocktime: number;
  start_block: number;
  end_block: number;
  num_of_votes?: number;
  lifecycle_stage?: string;
  data_eng_properties: DataEngProperties;
};

// =============================================================================
// Voting Module Specific Fields
// =============================================================================

/** Standard voting fields (simple for/against/abstain) */
export type StandardVotingFields = {
  voting_module_name?: "standard";
};

/** Approval voting fields (multi-choice) */
export type ApprovalVotingFields = {
  voting_module_name?: "approval";
  choices?: string[];
  max_approvals?: number;
  criteria?: number; // 1 = top N winners, 99 = threshold
  criteria_value?: number;
};

/** Optimistic voting fields (veto-based) */
export type OptimisticVotingFields = {
  voting_module_name?: "optimistic";
  tiers?: number[]; // basis points for tiered thresholds [1100, 1400, 1700]
};

export type VotingModuleFields =
  | StandardVotingFields
  | ApprovalVotingFields
  | OptimisticVotingFields;

// =============================================================================
// Source-Specific Proposal Types
// =============================================================================

/** dao_node (onchain) proposal fields */
export type DaoNodeProposalFields = {
  // Transaction location
  block_number?: string;
  transaction_index?: number;
  log_index?: number;

  // Proposal execution data
  targets?: string[];
  values?: number[];
  signatures?: string[];
  calldatas?: string[];
  description?: string;
  proposal_data?: string;
  decoded_proposal_data?: unknown[][] | DecodedStandardProposalData;
  proposal_type_info: FixedProposalType;
  // Voting module
  voting_module?: string;

  voting_module_name?: "standard" | "approval" | "optimistic";

  // Quorum/threshold
  quorum?: string | number;
  quorumVotes?: string | number;
  votableSupply?: string | number;
  votable_supply?: string | number;
  approval_threshold?: string | number;
  total_voting_power_at_start?: string;

  // Block timing
  blocktime?: number;
  after_start_block?: boolean;
  after_end_block?: boolean;

  // Lifecycle events
  created_event?: ArchiveProposalEvent;
  queue_event?: ArchiveProposalEvent;
  execute_event?: ArchiveProposalEvent;
  cancel_event?: ArchiveProposalEvent;

  // Vote data
  totals?: DaoNodeVoteTotals;

  // Hybrid flag
  hybrid?: boolean;

  // dao_node uses numeric proposal_type
  proposal_type: number;
};

/** eas-atlas proposal fields (OP citizen voting) */
export type EasAtlasProposalFields = {
  // EAS attestation fields
  uid: string;
  schema: string;
  time: number;
  expirationTime: number;
  revocationTime: number;
  refUID: string;
  recipient: string;
  attester: string;
  revocable: boolean;
  chain_id: string;
  contract: string;
  resolver?: string;

  // Proposal type info
  proposal_type_id: number;
  proposal_type: "STANDARD" | "OPTIMISTIC" | "OPTIMISTIC_TIERED" | "APPROVAL";

  // Voting configuration
  choices?: string[];
  max_approvals?: number;
  criteria?: number;
  criteria_value?: number;
  calculationOptions?: number;
  tiers?: number[];

  // Hybrid linking
  hybrid?: boolean;
  onchain_proposalid?: number;

  // Vote outcome
  outcome?: EasAtlasVoteOutcome;
};

/** eas-oodao proposal fields (generic DAO) */
export type EasOodaoProposalFields = {
  // Transaction info
  transaction_hash: string;
  dao_id: string;
  uid: string;
  chain_id: number;

  // Proposal type as object with full config
  proposal_type: FixedProposalType;
  proposal_type_approval?: "PENDING" | "APPROVED";
  default_proposal_type_ranges?: RangeProposalType;

  // Metadata
  tags?: string[];
  created_block_number?: number;
  created_time?: number;

  // Quorum checks
  quorum_check?: boolean;
  approval_check?: boolean;
  total_voting_power_at_start?: string;

  // Deletion
  delete_event?: ArchiveProposalDeleteEvent;

  // Vote outcome
  outcome?: EasOodaoVoteOutcome;
};

// =============================================================================
// Hybrid Proposal (govless_proposal nested structure)
// =============================================================================

/** Offchain portion of a hybrid proposal (nested in dao_node) */
export type GovlessProposal = Partial<EasAtlasProposalFields> & {
  id?: string;
  proposer?: string;
  proposer_ens?: string | null | { detail?: string };
  title?: string;
  start_block?: number;
  end_block?: number;
  start_blocktime?: number;
  end_blocktime?: number;
  num_of_votes?: number;
  data_eng_properties?: DataEngProperties;
  // eas-oodao fields that may be present in govless_proposal
  proposal_type_approval?: "PENDING" | "APPROVED";
};

/** dao_node hybrid proposal with nested govless_proposal */
export type DaoNodeHybridProposal = ArchiveProposalBase &
  DaoNodeProposalFields & {
    hybrid: true;
    govless_proposal: GovlessProposal;
  };

// =============================================================================
// Composed Source Types
// =============================================================================

export type DaoNodeProposal = ArchiveProposalBase &
  DaoNodeProposalFields & {
    hybrid?: boolean;
    govless_proposal?: GovlessProposal;
  };

export type EasAtlasProposal = ArchiveProposalBase & EasAtlasProposalFields;

export type EasOodaoProposal = ArchiveProposalBase & EasOodaoProposalFields;

// =============================================================================
// Discriminated Union by Source
// =============================================================================

export type ArchiveProposalBySource =
  | (DaoNodeProposal & { data_eng_properties: { source: "dao_node" } })
  | (EasAtlasProposal & { data_eng_properties: { source: "eas-atlas" } })
  | (EasOodaoProposal & { data_eng_properties: { source: "eas-oodao" } });

// =============================================================================
// Derived Proposal Type Helpers
// =============================================================================

/**
 * Derives the ProposalType from archive proposal data.
 * Accepts both ArchiveProposalBySource (discriminated union) and ArchiveListProposal (legacy).
 *
 * Logic:
 * - If hybrid flag is true → HYBRID_* variant
 * - If source is eas-atlas/eas-oodao without onchain ID → OFFCHAIN_* variant
 * - If source is dao_node → base type (STANDARD, APPROVAL, OPTIMISTIC)
 * - OPTIMISTIC with tiers → OPTIMISTIC_TIERED variant
 */
export function deriveProposalType(
  proposal: ArchiveProposalBySource | ArchiveListProposal
): ProposalType {
  const source = proposal.data_eng_properties.source;
  const hybrid = "hybrid" in proposal && proposal.hybrid === true;

  // Handle snapshot proposals
  if (source === "snapshot") {
    return "SNAPSHOT";
  }

  // Determine base class
  let baseClass: ProposalClass;
  let isTiered = false;

  if (source === "dao_node") {
    const daoProposal = proposal as DaoNodeProposal;
    const votingModule = daoProposal.voting_module_name;

    if (votingModule === "approval") {
      baseClass = "APPROVAL";
    } else if (votingModule === "optimistic") {
      baseClass = "OPTIMISTIC";
      // Check govless_proposal for tiered info
      if (daoProposal.govless_proposal?.tiers?.length) {
        isTiered = true;
      }
    } else {
      baseClass = "STANDARD";
    }
  } else if (source === "eas-atlas") {
    const atlasProposal = proposal as EasAtlasProposal;
    const propType = atlasProposal.proposal_type;

    if (propType === "APPROVAL") {
      baseClass = "APPROVAL";
    } else if (propType === "OPTIMISTIC" || propType === "OPTIMISTIC_TIERED") {
      baseClass = "OPTIMISTIC";
      isTiered =
        propType === "OPTIMISTIC_TIERED" || !!atlasProposal.tiers?.length;
    } else {
      baseClass = "STANDARD";
    }
  } else if (source === "eas-oodao") {
    const oodaoProposal = proposal as EasOodaoProposal;
    baseClass = oodaoProposal.proposal_type.class;
  } else {
    baseClass = "STANDARD";
  }

  // Determine final type based on hybrid/offchain status
  if (hybrid) {
    if (baseClass === "OPTIMISTIC" && isTiered) {
      return "HYBRID_OPTIMISTIC_TIERED";
    }
    return `HYBRID_${baseClass}` as ProposalType;
  }

  // Offchain-only proposals (eas-atlas without onchain link, or eas-oodao)
  if (source === "eas-atlas" || source === "eas-oodao") {
    const hasOnchainId =
      "onchain_proposalid" in proposal &&
      proposal.onchain_proposalid &&
      proposal.onchain_proposalid !== 0;

    if (!hasOnchainId) {
      if (baseClass === "OPTIMISTIC" && isTiered) {
        return "OFFCHAIN_OPTIMISTIC_TIERED";
      }
      return `OFFCHAIN_${baseClass}` as ProposalType;
    }
  }

  // Onchain dao_node proposals
  return baseClass as ProposalType;
}

export type ProposalTypeInfo = {
  quorum: number;
  approval_threshold: number;
};

// =============================================================================
// Legacy Compatibility (ArchiveListProposal)
// =============================================================================

/**
 * Union type for backward compatibility with existing code.
 * Prefer using ArchiveProposalBySource with type guards for new code.
 */
export type ArchiveListProposal = {
  // Common fields
  id: string;
  title: string;
  proposer: string;
  proposer_ens: string | null | { detail?: string };
  start_blocktime: number;
  end_blocktime: number;
  start_block: number;
  end_block: number;
  lifecycle_stage?: string;
  data_eng_properties: DataEngProperties;
  // Vote data - different keys for different sources
  totals?: DaoNodeVoteTotals;
  outcome?: EasAtlasVoteOutcome | EasOodaoVoteOutcome;

  // Proposal type - different formats for different sources
  proposal_type: number | string | FixedProposalType;
  default_proposal_type_ranges?: RangeProposalType;

  // Approval-specific fields
  choices?: string[];
  max_approvals?: number;
  criteria?: number;
  criteria_value?: number;

  // Optimistic-specific fields
  tiers?: number[];

  // Common metadata
  num_of_votes?: number;
  hybrid?: boolean;
  onchain_proposalid?: number | string;

  // Hybrid proposal - nested offchain voting data
  govless_proposal?: GovlessProposal;

  // dao_node specific fields
  block_number?: string;
  transaction_index?: number;
  log_index?: number;
  targets?: string[];
  values?: number[];
  signatures?: string[];
  calldatas?: string[];
  description?: string;
  voting_module?: string;
  voting_module_name?: "standard" | "approval" | "optimistic";
  decoded_proposal_data?: unknown[][] | DecodedStandardProposalData;
  proposal_data?: string;
  quorum: string;
  quorumVotes?: string | number;
  votableSupply?: string | number;
  votable_supply?: string | number;
  approval_threshold?: string | number;
  blocktime?: number;
  after_start_block?: boolean;
  after_end_block?: boolean;
  created_event?: ArchiveProposalEvent;
  queue_event?: ArchiveProposalEvent;
  execute_event?: ArchiveProposalEvent;
  cancel_event?: ArchiveProposalEvent;

  // eas-atlas specific fields
  uid?: string;
  schema?: string;
  time?: number;
  expirationTime?: number;
  revocationTime?: number;
  refUID?: string;
  recipient?: string;
  attester?: string;
  revocable?: boolean;
  contract?: string;
  resolver?: string;
  proposal_type_id?: number;
  calculationOptions?: number;

  // eas-oodao specific fields
  delete_event?: ArchiveProposalDeleteEvent;
  transaction_hash?: string;
  dao_id?: string;
  chain_id?: number | string;
  proposal_type_approval?: "PENDING" | "APPROVED";
  tags?: string[];
  created_block_number?: number;
  created_time?: number;
  quorum_check?: boolean;
  approval_check?: boolean;
  total_voting_power_at_start?: string;
  proposal_type_info?: ProposalTypeInfo;
};
