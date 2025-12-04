/**
 * Unified archive proposal normalization
 *
 * Transforms raw archive proposals from any source into the normalized Proposal type.
 * This is the single entry point for normalizing archive data for both list and detail views.
 */

import { Proposal } from "@/app/api/common/proposals/proposal";
import {
  deriveStatus,
  deriveTimeStatus,
  STATUS_LABEL_MAP,
  toDate,
  safeBigInt,
  safeBigIntOrNull,
  deriveProposalTag,
  resolveArchiveThresholds,
} from "@/components/Proposals/Proposal/Archive/archiveProposalUtils";
import { ARCHIVE_PROPOSAL_DEFAULTS } from "@/app/proposals/data/archiveDefaults";
import { ParsedProposalData, ParsedProposalResults } from "@/lib/proposalUtils";
import {
  ArchiveListProposal,
  DaoNodeVoteTotals,
  EasOodaoVoteOutcome,
  DecodedStandardProposalData,
  deriveProposalType,
} from "@/lib/types/archiveProposal";
import type { ArchiveProposalInput } from "./extractors/types";
import {
  extractStandardMetrics,
  extractApprovalMetrics,
  extractOptimisticMetrics,
  extractOptimisticTieredMetrics,
  isHybridProposal,
} from "./extractors";

// =============================================================================
// Types
// =============================================================================

export type NormalizeArchiveOptions = {
  namespace?: string | null;
  tokenDecimals?: number;
};

// =============================================================================
// Utility Functions
// =============================================================================

const getFunctionArgsName = (
  decodedData: ArchiveListProposal["decoded_proposal_data"]
) => {
  if (!decodedData || Array.isArray(decodedData)) {
    return [];
  }

  const { functionArgsName } = decodedData as DecodedStandardProposalData;
  return Array.isArray(functionArgsName) ? functionArgsName : [];
};

const normalizeOption = (proposal: ArchiveListProposal) => {
  if (!proposal.targets?.length) {
    return null;
  }

  return {
    targets: proposal.targets,
    values: proposal.values?.map(String) ?? [],
    signatures: proposal.signatures ?? [],
    calldatas:
      proposal.calldatas?.map((data) =>
        typeof data === "string" && data.startsWith("0x")
          ? (data as `0x${string}`)
          : (`0x${data}` as `0x${string}`)
      ) ?? [],
    functionArgsName: getFunctionArgsName(proposal.decoded_proposal_data),
  };
};

// =============================================================================
// Base Normalization (common to all proposal types)
// =============================================================================

function normalizeBase(
  proposal: ArchiveListProposal,
  options: NormalizeArchiveOptions
): Omit<Proposal, "proposalType" | "proposalData" | "proposalResults"> & {
  decimals: number;
  source: string | undefined;
} {
  const decimals = options.tokenDecimals ?? 18;
  const statusKey = deriveStatus(proposal, decimals);
  const normalizedStatusKey = STATUS_LABEL_MAP[statusKey]
    ? statusKey
    : "ACTIVE";

  const timeStatus = deriveTimeStatus(proposal, normalizedStatusKey);

  const createdTime =
    toDate(proposal.created_event?.blocktime) ||
    toDate(proposal.blocktime) ||
    timeStatus.proposalStartTime ||
    timeStatus.proposalEndTime ||
    null;
  const startTime = timeStatus.proposalStartTime || createdTime;
  const endTime = timeStatus.proposalEndTime || startTime;
  const queuedTime = toDate(proposal.queue_event?.blocktime) || null;

  const source = proposal.data_eng_properties?.source;

  const {
    quorum: quorumValue,
    approvalThreshold: approvalThresholdValue,
    votableSupply: votableSupplyValue,
  } = resolveArchiveThresholds(proposal);

  const markdowntitle =
    typeof proposal.title === "string" && proposal.title.trim().length > 0
      ? proposal.title
      : ARCHIVE_PROPOSAL_DEFAULTS.title;

  const description =
    typeof proposal.description === "string" &&
    proposal.description.trim().length > 0
      ? proposal.description
      : ARCHIVE_PROPOSAL_DEFAULTS.description;

  const proposerEns =
    typeof proposal.proposer_ens === "string"
      ? proposal.proposer_ens
      : proposal.proposer_ens?.detail;

  const proposalTypeData =
    typeof proposal.proposal_type === "object" && proposal.proposal_type
      ? {
          proposal_type_id: Number(proposal.proposal_type.eas_uid || 0),
          name: proposal.proposal_type.name || "Standard",
          quorum: safeBigInt(proposal.proposal_type.quorum || 0),
          approval_threshold: safeBigInt(
            proposal.proposal_type.approval_threshold || 0
          ),
        }
      : null;

  return {
    id: String(proposal.id),
    proposer:
      typeof proposal.proposer === "string"
        ? proposal.proposer.toLowerCase()
        : "",
    snapshotBlockNumber: Number(
      proposal.start_block ?? proposal.block_number ?? 0
    ),
    createdTime,
    startTime,
    startBlock: safeBigIntOrNull(proposal.start_block),
    endTime,
    endBlock: safeBigIntOrNull(proposal.end_block),
    cancelledTime:
      timeStatus.proposalCancelledTime ||
      toDate(proposal.delete_event?.attestation_time) ||
      null,
    executedTime:
      timeStatus.proposalExecutedTime ||
      toDate(proposal.execute_event?.blocktime) ||
      null,
    executedBlock: safeBigIntOrNull(proposal.execute_event?.block_number),
    queuedTime,
    markdowntitle,
    description,
    quorum: quorumValue,
    votableSupply: votableSupplyValue,
    approvalThreshold: approvalThresholdValue,
    unformattedProposalData: proposal.proposal_data
      ? proposal.proposal_data.startsWith("0x")
        ? (proposal.proposal_data as `0x${string}`)
        : (`0x${proposal.proposal_data}` as `0x${string}`)
      : null,
    proposalTypeData,
    status: normalizedStatusKey as Proposal["status"],
    createdTransactionHash: null,
    cancelledTransactionHash: proposal.cancel_event?.transaction_hash ?? null,
    executedTransactionHash: proposal.execute_event?.transaction_hash ?? null,
    offchainProposalId: undefined,
    proposalTypeApproval: proposal.proposal_type_approval,
    decimals,
    source,
  };
}

// =============================================================================
// Type-Specific Normalization
// =============================================================================

function normalizeStandardProposal(
  proposal: ArchiveListProposal,
  base: ReturnType<typeof normalizeBase>
): Proposal {
  const { decimals, source, ...baseFields } = base;

  const voteTotals =
    source === "eas-oodao"
      ? ((proposal.outcome as EasOodaoVoteOutcome)?.["token-holders"] ?? {})
      : ((proposal.totals as DaoNodeVoteTotals)?.["no-param"] ?? {});

  const forVotes = safeBigInt(voteTotals["1"]);
  const againstVotes = safeBigInt(voteTotals["0"]);
  const abstainVotes = safeBigInt(voteTotals["2"]);

  const option = normalizeOption(proposal);

  const proposalData: ParsedProposalData["STANDARD"]["kind"] & {
    source?: string;
  } = {
    options: option ? [option] : [],
    source,
  };

  const proposalResults = {
    for: forVotes,
    against: againstVotes,
    abstain: abstainVotes,
    decimals,
  } satisfies ParsedProposalResults["STANDARD"]["kind"] & {
    decimals?: number;
  };

  return {
    ...baseFields,
    proposalType: "STANDARD",
    proposalData,
    proposalResults,
  } as Proposal;
}

function normalizeApprovalProposal(
  proposal: ArchiveListProposal,
  base: ReturnType<typeof normalizeBase>
): Proposal {
  const { decimals, source, ...baseFields } = base;

  const metrics = extractApprovalMetrics(proposal, { tokenDecimals: decimals });

  // Build options array with full structure
  // Use extracted options if available (dao_node), otherwise build from choices
  const options =
    metrics.options.length > 0
      ? metrics.options.map((opt) => ({
          ...opt,
          functionArgsName: [] as {
            functionName: string;
            functionArgs: string[];
          }[],
        }))
      : metrics.choices.map((c) => ({
          targets: [] as string[],
          values: [] as string[],
          calldatas: [] as string[],
          description: c.text,
          functionArgsName: [] as {
            functionName: string;
            functionArgs: string[];
          }[],
          budgetTokensSpent: null,
        }));

  // Determine criteria: 0 = TOP_CHOICES, non-zero = THRESHOLD
  const criteriaType =
    metrics.criteria === 0 ? ("TOP_CHOICES" as const) : ("THRESHOLD" as const);

  const proposalData: ParsedProposalData["APPROVAL"]["kind"] & {
    source?: string;
  } = {
    options,
    proposalSettings: {
      maxApprovals: metrics.maxApprovals,
      criteria: criteriaType,
      budgetToken: metrics.budgetToken,
      criteriaValue: metrics.criteriaValue,
      budgetAmount: metrics.budgetAmount,
    },
    source,
  };

  const proposalResults = {
    options: metrics.choices.map((c) => ({
      option: c.text,
      votes: BigInt(Math.floor(c.approvals)),
    })),
    criteria: criteriaType,
    criteriaValue: metrics.criteriaValue,
    for: BigInt(0),
    against: BigInt(0),
    abstain: BigInt(0),
  };

  return {
    ...baseFields,
    proposalType: "APPROVAL",
    proposalData,
    proposalResults,
  } as unknown as Proposal;
}

function normalizeOptimisticProposal(
  proposal: ArchiveListProposal,
  base: ReturnType<typeof normalizeBase>
): Proposal {
  const { decimals, source, ...baseFields } = base;

  const metrics = extractOptimisticMetrics(proposal, {
    tokenDecimals: decimals,
  });

  // Extract raw vote values (same pattern as standard proposal)
  const voteTotals =
    source === "eas-oodao"
      ? ((proposal.outcome as EasOodaoVoteOutcome)?.["token-holders"] ?? {})
      : ((proposal.totals as DaoNodeVoteTotals)?.["no-param"] ?? {});

  const forVotes = safeBigInt(voteTotals["1"]);
  const againstVotes = safeBigInt(voteTotals["0"]);
  const abstainVotes = safeBigInt(voteTotals["2"]);

  const proposalData: ParsedProposalData["OPTIMISTIC"]["kind"] & {
    source?: string;
  } = {
    options: [],
    disapprovalThreshold: metrics.defeatThreshold,
    source,
  };

  const proposalResults = {
    for: forVotes,
    against: againstVotes,
    abstain: abstainVotes,
  } satisfies ParsedProposalResults["OPTIMISTIC"]["kind"];

  return {
    ...baseFields,
    proposalType: "OPTIMISTIC",
    proposalData,
    proposalResults,
  } as Proposal;
}

function normalizeOptimisticTieredProposal(
  proposal: ArchiveListProposal,
  base: ReturnType<typeof normalizeBase>
): Proposal {
  const { decimals, source, ...baseFields } = base;

  const metrics = extractOptimisticTieredMetrics(proposal, {
    tokenDecimals: decimals,
  });

  // Get govless_proposal outcome for citizen category breakdown
  const govlessOutcome = (proposal.govless_proposal?.outcome ?? {}) as Record<
    string,
    Record<string, number | string>
  >;

  const proposalData: ParsedProposalData["OFFCHAIN_OPTIMISTIC_TIERED"]["kind"] & {
    source?: string;
  } = {
    options: [],
    tiers: metrics.tiers,
    source,
  };

  // Build citizen category results
  const proposalResults: ParsedProposalResults["OFFCHAIN_OPTIMISTIC_TIERED"]["kind"] =
    {
      CHAIN: {
        for: safeBigInt(govlessOutcome?.CHAIN?.["1"]),
        against: safeBigInt(govlessOutcome?.CHAIN?.["0"]),
      },
      APP: {
        for: safeBigInt(govlessOutcome?.APP?.["1"]),
        against: safeBigInt(govlessOutcome?.APP?.["0"]),
      },
      USER: {
        for: safeBigInt(govlessOutcome?.USER?.["1"]),
        against: safeBigInt(govlessOutcome?.USER?.["0"]),
      },
      for: safeBigInt(metrics.supportCount),
      against: safeBigInt(metrics.againstCount),
    };

  return {
    ...baseFields,
    proposalType: "OFFCHAIN_OPTIMISTIC_TIERED",
    proposalData,
    proposalResults,
  } as Proposal;
}

// =============================================================================
// Main Entry Point
// =============================================================================

/**
 * Convert an archive proposal to a normalized Proposal.
 *
 * This is the single entry point for normalizing archive data.
 * It handles all proposal types and sources.
 *
 * @param proposal - Raw archive proposal from any source
 * @param options - Normalization options (namespace, tokenDecimals)
 * @returns Normalized Proposal object
 */
export function archiveToProposal(
  proposal: ArchiveProposalInput,
  options: NormalizeArchiveOptions = {}
): Proposal {
  const archiveProposal = proposal as ArchiveListProposal;
  const proposalType = deriveProposalType(archiveProposal);
  const base = normalizeBase(archiveProposal, options);

  // Add archive metadata
  const rawTag = Array.isArray(archiveProposal.tags)
    ? archiveProposal.tags[0]
    : undefined;
  const archiveMetadata = {
    source: base.source,
    rawTag,
    proposalTypeName:
      typeof archiveProposal.proposal_type === "object"
        ? archiveProposal.proposal_type?.name
        : undefined,
    proposalTypeTag: deriveProposalTag(archiveProposal),
    proposerEns:
      typeof archiveProposal.proposer_ens === "string"
        ? archiveProposal.proposer_ens
        : archiveProposal.proposer_ens?.detail,
    rawProposalType: archiveProposal.proposal_type,
    defaultProposalTypeRanges: archiveProposal.default_proposal_type_ranges,
  };

  let normalizedProposal: Proposal;

  switch (proposalType) {
    case "STANDARD":
    case "HYBRID_STANDARD":
    case "OFFCHAIN_STANDARD":
      normalizedProposal = normalizeStandardProposal(archiveProposal, base);
      normalizedProposal.proposalType = proposalType;
      break;

    case "APPROVAL":
    case "HYBRID_APPROVAL":
    case "OFFCHAIN_APPROVAL":
      normalizedProposal = normalizeApprovalProposal(archiveProposal, base);
      normalizedProposal.proposalType = proposalType;
      break;

    case "OPTIMISTIC":
    case "HYBRID_OPTIMISTIC":
    case "OFFCHAIN_OPTIMISTIC":
      normalizedProposal = normalizeOptimisticProposal(archiveProposal, base);
      normalizedProposal.proposalType = proposalType;
      break;

    case "HYBRID_OPTIMISTIC_TIERED":
    case "OFFCHAIN_OPTIMISTIC_TIERED":
      normalizedProposal = normalizeOptimisticTieredProposal(
        archiveProposal,
        base
      );
      normalizedProposal.proposalType = proposalType;
      break;

    case "SNAPSHOT":
      // Snapshot proposals use standard normalization
      normalizedProposal = normalizeStandardProposal(archiveProposal, base);
      normalizedProposal.proposalType = "SNAPSHOT";
      break;

    default:
      // Fallback to standard
      normalizedProposal = normalizeStandardProposal(archiveProposal, base);
  }

  return {
    ...normalizedProposal,
    archiveMetadata,
  } as Proposal & { archiveMetadata: typeof archiveMetadata };
}

// =============================================================================
// Re-export extractors for convenience
// =============================================================================

export {
  extractStandardMetrics,
  extractApprovalMetrics,
  extractOptimisticMetrics,
  extractOptimisticTieredMetrics,
} from "./extractors";
