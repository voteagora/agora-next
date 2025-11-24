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

// =============================================================================
// Type Guards
// =============================================================================

export function isDaoNodeProposal(
  proposal: ArchiveProposalBySource
): proposal is DaoNodeProposal & {
  data_eng_properties: { source: "dao_node" };
} {
  return proposal.data_eng_properties.source === "dao_node";
}

export function isEasAtlasProposal(
  proposal: ArchiveProposalBySource
): proposal is EasAtlasProposal & {
  data_eng_properties: { source: "eas-atlas" };
} {
  return proposal.data_eng_properties.source === "eas-atlas";
}

export function isEasOodaoProposal(
  proposal: ArchiveProposalBySource
): proposal is EasOodaoProposal & {
  data_eng_properties: { source: "eas-oodao" };
} {
  return proposal.data_eng_properties.source === "eas-oodao";
}

export function isHybridProposal(
  proposal: ArchiveProposalBySource
): proposal is DaoNodeProposal & {
  data_eng_properties: { source: "dao_node" };
  hybrid: true;
  govless_proposal: GovlessProposal;
} {
  return (
    isDaoNodeProposal(proposal) &&
    proposal.hybrid === true &&
    !!proposal.govless_proposal
  );
}

export function isApprovalProposal(proposal: ArchiveProposalBySource): boolean {
  if (isDaoNodeProposal(proposal)) {
    return proposal.voting_module_name === "approval";
  }
  if (isEasAtlasProposal(proposal)) {
    return proposal.proposal_type === "APPROVAL";
  }
  if (isEasOodaoProposal(proposal)) {
    return proposal.proposal_type.class === "APPROVAL";
  }
  return false;
}

export function isOptimisticProposal(
  proposal: ArchiveProposalBySource
): boolean {
  if (isDaoNodeProposal(proposal)) {
    return proposal.voting_module_name === "optimistic";
  }
  if (isEasAtlasProposal(proposal)) {
    return (
      proposal.proposal_type === "OPTIMISTIC" ||
      proposal.proposal_type === "OPTIMISTIC_TIERED"
    );
  }
  if (isEasOodaoProposal(proposal)) {
    return proposal.proposal_type.class === "OPTIMISTIC";
  }
  return false;
}

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
  quorum?: string | number;
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
};

// =============================================================================
// Proposal Status (mirrors proposalUtils/proposalStatus.ts)
// =============================================================================

/**
 * Proposal status enum - matches ProposalStatus from proposalUtils/proposalStatus.ts
 */
export type ArchiveProposalStatus =
  | "CANCELLED"
  | "SUCCEEDED"
  | "DEFEATED"
  | "ACTIVE"
  | "FAILED"
  | "PENDING"
  | "QUEUED"
  | "EXECUTED"
  | "CLOSED"
  | "PASSED";

// =============================================================================
// Parsed Proposal Results (mirrors proposalUtils/parseProposalResults.ts)
// =============================================================================

/** Standard vote tallies (for/against/abstain) */
export type StandardVoteTallies = {
  for: bigint;
  against: bigint;
  abstain: bigint;
};

/** Citizen category vote tallies for hybrid/offchain proposals */
export type CitizenCategoryTallies = {
  APP: StandardVoteTallies;
  USER: StandardVoteTallies;
  CHAIN: StandardVoteTallies;
};

/** Approval option with votes */
export type ApprovalOptionResult = {
  option: string;
  votes: bigint;
};

/** Approval option with weighted metrics (for hybrid/offchain) */
export type ApprovalOptionMetrics = {
  option: string;
  weightedPercentage: number;
  isApproved: boolean;
};

/** Citizen category approval tallies (option -> votes mapping) */
export type CitizenCategoryApprovalTallies = {
  APP: Record<string, bigint>;
  USER: Record<string, bigint>;
  CHAIN: Record<string, bigint>;
};

/**
 * Parsed proposal results - discriminated union by proposal type.
 * Mirrors ParsedProposalResults from proposalUtils.ts
 */
export type ArchiveParsedProposalResults = {
  STANDARD: {
    key: "STANDARD";
    kind: StandardVoteTallies;
  };
  OFFCHAIN_STANDARD: {
    key: "OFFCHAIN_STANDARD";
    kind: StandardVoteTallies & CitizenCategoryTallies;
  };
  OPTIMISTIC: {
    key: "OPTIMISTIC";
    kind: StandardVoteTallies;
  };
  APPROVAL: {
    key: "APPROVAL";
    kind: StandardVoteTallies & {
      options: ApprovalOptionResult[];
      criteria: "TOP_CHOICES" | "THRESHOLD";
      criteriaValue: bigint;
    };
  };
  OFFCHAIN_APPROVAL: {
    key: "OFFCHAIN_APPROVAL";
    kind: StandardVoteTallies & {
      options: ApprovalOptionMetrics[];
    };
  };
  HYBRID_STANDARD: {
    key: "HYBRID_STANDARD";
    kind: CitizenCategoryTallies & {
      DELEGATES: StandardVoteTallies;
    };
  };
  HYBRID_OPTIMISTIC: {
    key: "HYBRID_OPTIMISTIC";
    kind: CitizenCategoryTallies & {
      DELEGATES: StandardVoteTallies;
    };
  };
  HYBRID_OPTIMISTIC_TIERED: {
    key: "HYBRID_OPTIMISTIC_TIERED";
    kind: CitizenCategoryTallies &
      StandardVoteTallies & {
        DELEGATES: StandardVoteTallies;
      };
  };
  OFFCHAIN_OPTIMISTIC: {
    key: "OFFCHAIN_OPTIMISTIC";
    kind: StandardVoteTallies & CitizenCategoryTallies;
  };
  OFFCHAIN_OPTIMISTIC_TIERED: {
    key: "OFFCHAIN_OPTIMISTIC_TIERED";
    kind: StandardVoteTallies & CitizenCategoryTallies;
  };
  HYBRID_APPROVAL: {
    key: "HYBRID_APPROVAL";
    kind: StandardVoteTallies &
      CitizenCategoryApprovalTallies & {
        DELEGATES: Record<string, bigint>;
        options: ApprovalOptionMetrics[];
        criteria: "TOP_CHOICES" | "THRESHOLD";
        criteriaValue: bigint;
        totals?: Record<string, unknown>;
      };
  };
};

// =============================================================================
// Parsing Functions (mirrors parseProposalResults logic)
// =============================================================================

/**
 * Helper to extract vote value from EasAtlasVoteOutcome format.
 * Handles both simple numbers and nested { "1": number } objects.
 */
function extractVoteValue(value: number | { "1": number } | undefined): number {
  if (value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "object" && "1" in value) return value["1"];
  return 0;
}

/**
 * Helper to process citizen category tallies from outcome data.
 * Used for eas-atlas and govless_proposal outcome format.
 */
function processCitizenTallies(
  outcome: EasAtlasVoteOutcome | undefined
): CitizenCategoryTallies {
  const processTallySource = (
    sourceData: { [choiceIndex: string]: number | { "1": number } } | undefined
  ): StandardVoteTallies => ({
    for: BigInt(
      extractVoteValue(sourceData?.["1"]) ||
        extractVoteValue(sourceData?.["2"]) ||
        0
    ),
    against: BigInt(extractVoteValue(sourceData?.["0"]) || 0),
    abstain: BigInt(extractVoteValue(sourceData?.["2"]) || 0),
  });

  return {
    APP: processTallySource(outcome?.APP),
    USER: processTallySource(outcome?.USER),
    CHAIN: processTallySource(outcome?.CHAIN),
  };
}

/**
 * Helper to process dao_node standard vote totals.
 */
function processDaoNodeStandardTotals(
  totals: DaoNodeVoteTotals | undefined
): StandardVoteTallies {
  const noParamTotals = totals?.["no-param"];
  return {
    for: BigInt(noParamTotals?.["1"] ?? 0),
    against: BigInt(noParamTotals?.["0"] ?? 0),
    abstain: BigInt(noParamTotals?.["2"] ?? 0),
  };
}

/**
 * Helper to process dao_node approval vote totals.
 */
function processDaoNodeApprovalTotals(
  totals: DaoNodeVoteTotals | undefined,
  options: string[]
): ApprovalOptionResult[] {
  return options.map((option, idx) => ({
    option,
    votes: BigInt(totals?.[idx.toString()]?.["1"] ?? 0),
  }));
}

/**
 * Helper to process citizen category approval tallies.
 */
function processCitizenApprovalTallies(
  outcome: EasAtlasVoteOutcome | undefined
): CitizenCategoryApprovalTallies {
  const processApprovalSource = (
    sourceData: { [choiceIndex: string]: number | { "1": number } } | undefined
  ): Record<string, bigint> => {
    if (!sourceData) return {};
    const result: Record<string, bigint> = {};
    for (const [key, value] of Object.entries(sourceData)) {
      result[key] = BigInt(
        extractVoteValue(value as number | { "1": number }) ?? 0
      );
    }
    return result;
  };

  return {
    APP: processApprovalSource(outcome?.APP),
    USER: processApprovalSource(outcome?.USER),
    CHAIN: processApprovalSource(outcome?.CHAIN),
  };
}

/**
 * Parse archive proposal into structured results based on proposal type.
 * Mirrors parseProposalResults from proposalUtils/parseProposalResults.ts
 */
export function parseArchiveProposalResults(
  proposal: ArchiveListProposal,
  proposalType: ProposalType
): ArchiveParsedProposalResults[keyof ArchiveParsedProposalResults] {
  const source = proposal.data_eng_properties?.source;
  const isHybrid = proposal.hybrid && proposal.govless_proposal;
  const govlessOutcome = proposal.govless_proposal?.outcome as
    | EasAtlasVoteOutcome
    | undefined;

  switch (proposalType) {
    case "STANDARD":
    case "OPTIMISTIC": {
      const tallies = processDaoNodeStandardTotals(proposal.totals);
      return {
        key: proposalType,
        kind: tallies,
      };
    }

    case "OFFCHAIN_STANDARD": {
      const outcome = proposal.outcome as EasAtlasVoteOutcome | undefined;
      const citizenTallies = processCitizenTallies(outcome);
      const combined: StandardVoteTallies = {
        for:
          citizenTallies.APP.for +
          citizenTallies.USER.for +
          citizenTallies.CHAIN.for,
        against:
          citizenTallies.APP.against +
          citizenTallies.USER.against +
          citizenTallies.CHAIN.against,
        abstain:
          citizenTallies.APP.abstain +
          citizenTallies.USER.abstain +
          citizenTallies.CHAIN.abstain,
      };
      return {
        key: "OFFCHAIN_STANDARD",
        kind: { ...combined, ...citizenTallies },
      };
    }

    case "HYBRID_STANDARD": {
      const delegateTallies = processDaoNodeStandardTotals(proposal.totals);
      const citizenTallies = processCitizenTallies(govlessOutcome);
      return {
        key: "HYBRID_STANDARD",
        kind: {
          ...citizenTallies,
          DELEGATES: delegateTallies,
        },
      };
    }

    case "HYBRID_OPTIMISTIC": {
      const delegateTallies = processDaoNodeStandardTotals(proposal.totals);
      const citizenTallies = processCitizenTallies(govlessOutcome);
      return {
        key: "HYBRID_OPTIMISTIC",
        kind: {
          ...citizenTallies,
          DELEGATES: delegateTallies,
        },
      };
    }

    case "HYBRID_OPTIMISTIC_TIERED": {
      const delegateTallies = processDaoNodeStandardTotals(proposal.totals);
      const citizenTallies = processCitizenTallies(govlessOutcome);
      return {
        key: "HYBRID_OPTIMISTIC_TIERED",
        kind: {
          ...citizenTallies,
          ...delegateTallies,
          DELEGATES: delegateTallies,
        },
      };
    }

    case "OFFCHAIN_OPTIMISTIC":
    case "OFFCHAIN_OPTIMISTIC_TIERED": {
      const outcome = proposal.outcome as EasAtlasVoteOutcome | undefined;
      const citizenTallies = processCitizenTallies(outcome);
      const combined: StandardVoteTallies = {
        for:
          citizenTallies.APP.for +
          citizenTallies.USER.for +
          citizenTallies.CHAIN.for,
        against:
          citizenTallies.APP.against +
          citizenTallies.USER.against +
          citizenTallies.CHAIN.against,
        abstain:
          citizenTallies.APP.abstain +
          citizenTallies.USER.abstain +
          citizenTallies.CHAIN.abstain,
      };
      return {
        key: proposalType,
        kind: { ...combined, ...citizenTallies },
      };
    }

    case "APPROVAL": {
      const tallies = processDaoNodeStandardTotals(proposal.totals);
      const options = proposal.choices || [];
      const optionResults = processDaoNodeApprovalTotals(
        proposal.totals,
        options
      );
      const criteria =
        proposal.criteria === 0 ? "TOP_CHOICES" : ("THRESHOLD" as const);
      return {
        key: "APPROVAL",
        kind: {
          ...tallies,
          options: optionResults,
          criteria,
          criteriaValue: BigInt(proposal.criteria_value ?? 0),
        },
      };
    }

    case "OFFCHAIN_APPROVAL": {
      const outcome = proposal.outcome as EasAtlasVoteOutcome | undefined;
      const citizenTallies = processCitizenTallies(outcome);
      const combined: StandardVoteTallies = {
        for:
          citizenTallies.APP.for +
          citizenTallies.USER.for +
          citizenTallies.CHAIN.for,
        against:
          citizenTallies.APP.against +
          citizenTallies.USER.against +
          citizenTallies.CHAIN.against,
        abstain:
          citizenTallies.APP.abstain +
          citizenTallies.USER.abstain +
          citizenTallies.CHAIN.abstain,
      };
      const options = (proposal.choices || []).map((choice) => ({
        option: choice,
        weightedPercentage: 0,
        isApproved: false,
      }));
      return {
        key: "OFFCHAIN_APPROVAL",
        kind: { ...combined, options },
      };
    }

    case "HYBRID_APPROVAL": {
      const delegateTallies = processDaoNodeStandardTotals(proposal.totals);
      const citizenApprovalTallies =
        processCitizenApprovalTallies(govlessOutcome);
      const choices = proposal.choices || [];

      // Build DELEGATES option mapping
      const delegatesOptions: Record<string, bigint> = {};
      choices.forEach((choice, idx) => {
        delegatesOptions[choice] = BigInt(
          proposal.totals?.[idx.toString()]?.["1"] ?? 0
        );
      });

      const options = choices.map((choice) => ({
        option: choice,
        weightedPercentage: 0,
        isApproved: false,
      }));

      const criteria =
        proposal.criteria === 0 ? "TOP_CHOICES" : ("THRESHOLD" as const);

      return {
        key: "HYBRID_APPROVAL",
        kind: {
          ...delegateTallies,
          ...citizenApprovalTallies,
          DELEGATES: delegatesOptions,
          options,
          criteria,
          criteriaValue: BigInt(proposal.criteria_value ?? 0),
        },
      };
    }

    default:
      // Fallback for unknown types
      return {
        key: "STANDARD",
        kind: { for: 0n, against: 0n, abstain: 0n },
      };
  }
}

// =============================================================================
// Status Derivation (mirrors proposalUtils/proposalStatus.ts logic)
// =============================================================================

/**
 * Derive proposal status from archive proposal data.
 * Mirrors getProposalStatus from proposalUtils/proposalStatus.ts
 *
 * @param proposal - The archive proposal
 * @param proposalType - The derived proposal type
 * @param currentTimestamp - Current timestamp (seconds) for time-based checks
 * @param quorum - Optional quorum value (in voting power units)
 * @param votableSupply - Optional votable supply for optimistic checks
 * @param approvalThreshold - Optional approval threshold (basis points, e.g., 5100 = 51%)
 */
export function getArchiveProposalStatus(
  proposal: ArchiveListProposal,
  proposalType: ProposalType,
  currentTimestamp: number,
  quorum?: bigint,
  votableSupply?: bigint,
  approvalThreshold?: bigint
): ArchiveProposalStatus {
  // 1. Check lifecycle events first (cancelled, executed, queued)
  if (proposal.cancel_event || proposal.lifecycle_stage === "CANCELED") {
    return "CANCELLED";
  }

  if (proposal.execute_event || proposal.lifecycle_stage === "EXECUTED") {
    return "EXECUTED";
  }

  if (proposal.queue_event || proposal.lifecycle_stage === "QUEUED") {
    // Check if queued for more than 10 days without execution (PASSED for no-calldata proposals)
    const TEN_DAYS_IN_SECONDS = 10 * 24 * 60 * 60;
    const queuedTime = proposal.queue_event?.blocktime;
    if (queuedTime && currentTimestamp - queuedTime > TEN_DAYS_IN_SECONDS) {
      // Would need to check calldata here, but for archive we assume PASSED
      return "PASSED";
    }
    return "QUEUED";
  }

  // 2. Check time-based status (PENDING, ACTIVE)
  const startTime = proposal.start_blocktime;
  const endTime = proposal.end_blocktime;

  if (startTime && currentTimestamp < startTime) {
    return "PENDING";
  }

  if (endTime && currentTimestamp < endTime) {
    return "ACTIVE";
  }

  // 3. Voting has ended - determine outcome based on results
  const results = parseArchiveProposalResults(proposal, proposalType);

  switch (results.key) {
    case "STANDARD":
    case "OFFCHAIN_STANDARD": {
      const { for: forVotes, against: againstVotes } = results.kind;

      // Threshold check (if provided)
      if (approvalThreshold !== undefined) {
        const thresholdVotes = forVotes + againstVotes;
        const voteThresholdPercent =
          thresholdVotes > 0n
            ? (Number(forVotes) / Number(thresholdVotes)) * 100
            : 0;
        const apprThresholdPercent = Number(approvalThreshold) / 100;
        if (voteThresholdPercent < apprThresholdPercent) {
          return "DEFEATED";
        }
      }

      // Quorum check
      if (quorum !== undefined) {
        const quorumVotes = forVotes + againstVotes; // Or for + abstain depending on config
        if (quorumVotes < quorum) {
          return "DEFEATED";
        }
      }

      // For vs Against
      if (forVotes > againstVotes) {
        return "SUCCEEDED";
      } else if (againstVotes > forVotes) {
        return "DEFEATED";
      }
      return "FAILED";
    }

    case "OPTIMISTIC": {
      const { against: againstVotes } = results.kind;
      // Optimistic: defeated only if against > 50% of votable supply
      if (votableSupply && againstVotes > votableSupply / 2n) {
        return "DEFEATED";
      }
      return "SUCCEEDED";
    }

    case "APPROVAL": {
      const {
        for: forVotes,
        abstain: abstainVotes,
        options,
        criteria,
        criteriaValue,
      } = results.kind;
      const proposalQuorumVotes = forVotes + abstainVotes;

      // Quorum check
      if (quorum && proposalQuorumVotes < quorum) {
        return "DEFEATED";
      }

      // Criteria check
      if (criteria === "THRESHOLD") {
        for (const option of options) {
          if (option.votes > criteriaValue) {
            return "SUCCEEDED";
          }
        }
        return "DEFEATED";
      }
      return "SUCCEEDED";
    }

    case "OFFCHAIN_APPROVAL": {
      const { for: forVotes, abstain: abstainVotes } = results.kind;
      const proposalQuorumVotes = forVotes + abstainVotes;

      if (quorum && proposalQuorumVotes < quorum) {
        return "DEFEATED";
      }
      return "SUCCEEDED";
    }

    case "HYBRID_STANDARD": {
      // For hybrid standard, need weighted calculation
      // Simplified: check if total for > total against across all categories
      const { APP, USER, CHAIN, DELEGATES } = results.kind;
      const totalFor = APP.for + USER.for + CHAIN.for + DELEGATES.for;
      const totalAgainst =
        APP.against + USER.against + CHAIN.against + DELEGATES.against;

      if (totalFor > totalAgainst) {
        return "SUCCEEDED";
      }
      return "DEFEATED";
    }

    case "HYBRID_OPTIMISTIC":
    case "HYBRID_OPTIMISTIC_TIERED":
    case "OFFCHAIN_OPTIMISTIC":
    case "OFFCHAIN_OPTIMISTIC_TIERED": {
      // For optimistic variants, check weighted against percentage
      const { APP, USER, CHAIN } = results.kind;
      const totalAgainst = APP.against + USER.against + CHAIN.against;
      const totalFor = APP.for + USER.for + CHAIN.for;
      const totalVotes = totalFor + totalAgainst;

      // Veto threshold check (typically 17%)
      const VETO_THRESHOLD = 17;
      const againstPercentage =
        totalVotes > 0n ? (Number(totalAgainst) / Number(totalVotes)) * 100 : 0;

      if (againstPercentage >= VETO_THRESHOLD) {
        return "DEFEATED";
      }
      return "SUCCEEDED";
    }

    case "HYBRID_APPROVAL": {
      const { options } = results.kind;

      // Quorum check would require weighted calculation
      // Simplified: check if any option meets threshold
      const anyApproved = options.some((opt) => opt.isApproved);
      return anyApproved ? "SUCCEEDED" : "DEFEATED";
    }

    default:
      return "FAILED";
  }
}
