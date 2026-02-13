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
  extractApprovalMetrics,
  extractOptimisticMetrics,
  extractOptimisticTieredMetrics,
  isHybridProposal,
} from "./extractors";
import { ProposalType } from "../types";

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
            proposal.proposal_type.approval_threshold
          ),
        }
      : {
          proposal_type_id: 0,
          name: "Standard",
          quorum: 0n,
          approval_threshold: 0n,
        };

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
  base: ReturnType<typeof normalizeBase>,
  proposalType: ProposalType = "STANDARD"
): Proposal {
  const { decimals, source, ...baseFields } = base;
  const isHybrid = proposalType === "HYBRID_STANDARD";
  const isOffchain =
    proposalType === "OFFCHAIN_STANDARD" || source === "eas-atlas";

  const option = normalizeOption(proposal);

  const proposalData: ParsedProposalData["STANDARD"]["kind"] & {
    source?: string;
  } = {
    options: option ? [option] : [],
    source,
  };

  if (isHybrid) {
    // HYBRID_STANDARD: Include both delegate and citizen votes
    const delegateTotals =
      (proposal.totals as DaoNodeVoteTotals)?.["no-param"] ?? {};
    const delegateFor = safeBigInt(delegateTotals["1"]);
    const delegateAgainst = safeBigInt(delegateTotals["0"]);
    const delegateAbstain = safeBigInt(delegateTotals["2"]);

    const govlessOutcome = (proposal.govless_proposal?.outcome ?? {}) as Record<
      string,
      Record<string, number | string>
    >;

    const proposalResults = {
      CHAIN: {
        for: safeBigInt(govlessOutcome?.CHAIN?.["1"]),
        against: safeBigInt(govlessOutcome?.CHAIN?.["0"]),
        abstain: safeBigInt(govlessOutcome?.CHAIN?.["2"]),
      },
      APP: {
        for: safeBigInt(govlessOutcome?.APP?.["1"]),
        against: safeBigInt(govlessOutcome?.APP?.["0"]),
        abstain: safeBigInt(govlessOutcome?.APP?.["2"]),
      },
      USER: {
        for: safeBigInt(govlessOutcome?.USER?.["1"]),
        against: safeBigInt(govlessOutcome?.USER?.["0"]),
        abstain: safeBigInt(govlessOutcome?.USER?.["2"]),
      },
      DELEGATES: {
        for: delegateFor,
        against: delegateAgainst,
        abstain: delegateAbstain,
      },
      for: delegateFor,
      against: delegateAgainst,
      abstain: delegateAbstain,
      decimals,
    };

    return {
      ...baseFields,
      proposalType: "HYBRID_STANDARD",
      proposalData,
      proposalResults,
    } as Proposal;
  } else if (isOffchain) {
    // OFFCHAIN_STANDARD: Only citizen votes from eas-atlas
    const govlessOutcome = (proposal.outcome ?? {}) as Record<
      string,
      Record<string, number | string>
    >;

    const proposalResults = {
      CHAIN: {
        for: safeBigInt(govlessOutcome?.CHAIN?.["1"]),
        against: safeBigInt(govlessOutcome?.CHAIN?.["0"]),
        abstain: safeBigInt(govlessOutcome?.CHAIN?.["2"]),
      },
      APP: {
        for: safeBigInt(govlessOutcome?.APP?.["1"]),
        against: safeBigInt(govlessOutcome?.APP?.["0"]),
        abstain: safeBigInt(govlessOutcome?.APP?.["2"]),
      },
      USER: {
        for: safeBigInt(govlessOutcome?.USER?.["1"]),
        against: safeBigInt(govlessOutcome?.USER?.["0"]),
        abstain: safeBigInt(govlessOutcome?.USER?.["2"]),
      },
      for: 0n,
      against: 0n,
      abstain: 0n,
      decimals,
    };

    return {
      ...baseFields,
      proposalType: "OFFCHAIN_STANDARD",
      proposalData,
      proposalResults,
    } as Proposal;
  } else {
    // Pure STANDARD: Only delegate/onchain votes
    const voteTotals =
      source === "eas-oodao"
        ? ((proposal.outcome as EasOodaoVoteOutcome)?.["no-param"] ?? {})
        : ((proposal.totals as DaoNodeVoteTotals)?.["no-param"] ?? {});

    const forVotes = safeBigInt(voteTotals["1"]);
    const againstVotes = safeBigInt(voteTotals["0"]);
    const abstainVotes = safeBigInt(voteTotals["2"]);

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

  // Determine criteria: 0 = THRESHOLD, 1 = TOP_CHOICES
  const criteriaType =
    metrics.criteria === 1 ? ("TOP_CHOICES" as const) : ("THRESHOLD" as const);

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

  // Extract vote totals from totals["no-param"] or outcome["no-param"] depending on source
  // For eas-oodao, vote data is in outcome, not totals
  const voteTotals =
    source === "eas-oodao"
      ? (proposal.outcome as Record<string, Record<string, string>>)?.[
          "no-param"
        ] || {}
      : proposal.totals?.["no-param"] || {};

  const proposalResults = {
    options: metrics.choices.map((c) => ({
      option: c.text,
      // Use approvalsRaw (BigInt) if available, otherwise convert approvals (number) to BigInt
      votes: c.approvalsRaw ?? BigInt(Math.floor(c.approvals)),
    })),
    criteria: criteriaType,
    criteriaValue: metrics.criteriaValue,
    for: safeBigInt(voteTotals["1"]),
    against: safeBigInt(voteTotals["0"]),
    abstain: safeBigInt(voteTotals["2"]),
  };

  // For HYBRID_APPROVAL, add DELEGATES + per-type per-option vote maps and totals
  if (proposal.hybrid && proposal.govless_proposal) {
    // Build DELEGATES per-option vote map from onchain totals
    // Keys are option description names, values are delegate vote counts
    const delegatesOptions: Record<string, bigint> = {};
    for (const choice of metrics.choices) {
      const optionTotals = (
        proposal.totals as Record<string, Record<string, string>>
      )?.[choice.index.toString()];
      delegatesOptions[choice.text] = BigInt(optionTotals?.["1"] ?? "0");
    }
    (proposalResults as any).DELEGATES = delegatesOptions;

    const outcome = (proposal.govless_proposal.outcome ?? {}) as Record<
      string,
      Record<string, Record<string, number>>
    >;

    // Build per-type per-option vote maps from outcome
    // Keys must be option description names (matching DELEGATES keys)
    const citizenTypes = ["APP", "USER", "CHAIN"] as const;
    for (const citizenType of citizenTypes) {
      const typeOutcome = outcome[citizenType];
      if (!typeOutcome) continue;

      const optionVotes: Record<string, bigint> = {};
      for (const [optionIndex, votes] of Object.entries(typeOutcome)) {
        const choiceText = metrics.choices.find(
          (c) => c.index === Number(optionIndex)
        )?.text;
        if (choiceText) {
          optionVotes[choiceText] = BigInt(votes["1"] ?? 0);
        }
      }
      (proposalResults as any)[citizenType] = optionVotes;
    }

    // Build totals.vote_counts with per-type unique voter counts
    // Since the archive doesn't provide per-type unique voter counts directly,
    // we derive them by finding the max votes any single option received per type
    // (a lower bound for unique voters, since each voter votes at least once)
    const getMaxVotesForType = (
      typeOutcome: Record<string, Record<string, number>> | undefined
    ): number => {
      if (!typeOutcome) return 0;
      return Math.max(
        0,
        ...Object.values(typeOutcome).map((v) => Number(v["1"] ?? 0))
      );
    };

    (proposalResults as any).totals = {
      vote_counts: {
        APP: getMaxVotesForType(outcome.APP),
        USER: getMaxVotesForType(outcome.USER),
        CHAIN: getMaxVotesForType(outcome.CHAIN),
      },
    };
  }

  return {
    ...baseFields,
    proposalType: "APPROVAL",
    proposalData,
    proposalResults,
  } as unknown as Proposal;
}

function normalizeOptimisticProposal(
  proposal: ArchiveListProposal,
  base: ReturnType<typeof normalizeBase>,
  proposalType: ProposalType
): Proposal {
  const { decimals, source, ...baseFields } = base;
  const isHybrid = proposalType === "HYBRID_OPTIMISTIC";

  const metrics = extractOptimisticMetrics(proposal, {
    tokenDecimals: decimals,
  });
  // Extract delegate votes (for hybrid and pure optimistic)
  const delegateTotals =
    (proposal.totals as DaoNodeVoteTotals)?.["no-param"] ?? {};
  const delegateFor = safeBigInt(delegateTotals["1"]);
  const delegateAgainst = safeBigInt(delegateTotals["0"]);
  const delegateAbstain = safeBigInt(delegateTotals["2"]);

  if (isHybrid) {
    // HYBRID_OPTIMISTIC: Include both delegate and citizen votes
    const govlessOutcome = (proposal.govless_proposal?.outcome ?? {}) as Record<
      string,
      Record<string, number | string>
    >;

    const proposalData = {
      options: [] as [],
      disapprovalThreshold: metrics.defeatThreshold,
      source,
    };

    // For hybrid, include citizen breakdown and delegates
    const proposalResults = {
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
      DELEGATES: {
        for: delegateFor,
        against: delegateAgainst,
      },
    };

    return {
      ...baseFields,
      proposalType: "HYBRID_OPTIMISTIC",
      proposalData,
      proposalResults,
    } as Proposal;
  } else if (source === "eas-atlas") {
    // OFFCHAIN_OPTIMISTIC: Only citizen votes
    const govlessOutcome = (proposal.outcome ?? {}) as Record<
      string,
      Record<string, number | string>
    >;

    const proposalData = {
      options: [] as [],
      disapprovalThreshold: metrics.defeatThreshold,
      tiers: [] as number[],
      source,
    };

    const proposalResults = {
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
      for: 0n,
      against: 0n,
    };

    return {
      ...baseFields,
      proposalType: "OFFCHAIN_OPTIMISTIC",
      proposalData,
      proposalResults,
    } as Proposal;
  } else {
    // Pure OPTIMISTIC: Only delegate votes
    const proposalData: ParsedProposalData["OPTIMISTIC"]["kind"] & {
      source?: string;
    } = {
      options: [],
      disapprovalThreshold: metrics.defeatThreshold,
      source,
    };

    const proposalResults = {
      for: delegateFor,
      against: delegateAgainst,
      abstain: delegateAbstain,
    } satisfies ParsedProposalResults["OPTIMISTIC"]["kind"];

    return {
      ...baseFields,
      proposalType: "OPTIMISTIC",
      proposalData,
      proposalResults,
    } as Proposal;
  }
}

function normalizeOptimisticTieredProposal(
  proposal: ArchiveListProposal,
  base: ReturnType<typeof normalizeBase>,
  proposalType: ProposalType
): Proposal {
  const { decimals, source, ...baseFields } = base;
  const isHybrid = proposalType === "HYBRID_OPTIMISTIC_TIERED";

  const metrics = extractOptimisticTieredMetrics(proposal, {
    tokenDecimals: decimals,
  });

  // Get citizen outcome - from govless_proposal for hybrid, from outcome for offchain
  const govlessOutcome = isHybrid
    ? ((proposal.govless_proposal?.outcome ?? {}) as Record<
        string,
        Record<string, number | string>
      >)
    : ((proposal.outcome ?? {}) as Record<
        string,
        Record<string, number | string>
      >);

  // Extract delegate votes (only for hybrid)
  const delegateTotals =
    (proposal.totals as DaoNodeVoteTotals)?.["no-param"] ?? {};
  const delegateFor = safeBigInt(delegateTotals["1"]);
  const delegateAgainst = safeBigInt(delegateTotals["0"]);

  if (isHybrid) {
    // HYBRID_OPTIMISTIC_TIERED: Include both delegate and citizen votes
    const proposalData: ParsedProposalData["HYBRID_OPTIMISTIC_TIERED"]["kind"] & {
      source?: string;
    } = {
      options: [],
      tiers: metrics.tiers.sort((a, b) => b - a).map((tier) => tier / 100),
      source,
    };

    const proposalResults: ParsedProposalResults["HYBRID_OPTIMISTIC_TIERED"]["kind"] =
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
        DELEGATES: {
          for: delegateFor,
          against: delegateAgainst,
        },
        for: delegateFor,
        against: delegateAgainst,
      };

    return {
      ...baseFields,
      proposalType: "HYBRID_OPTIMISTIC_TIERED",
      proposalData,
      proposalResults,
    } as Proposal;
  } else {
    // OFFCHAIN_OPTIMISTIC_TIERED: Only citizen votes
    const proposalData: ParsedProposalData["OFFCHAIN_OPTIMISTIC_TIERED"]["kind"] & {
      source?: string;
    } = {
      options: [],
      tiers: metrics.tiers.sort((a, b) => b - a).map((tier) => tier / 100),
      source,
    };

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
  let archiveProposal = proposal as ArchiveListProposal;
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
      normalizedProposal = normalizeStandardProposal(
        archiveProposal,
        base,
        proposalType
      );
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
      normalizedProposal = normalizeOptimisticProposal(
        archiveProposal,
        base,
        proposalType
      );
      break;

    case "HYBRID_OPTIMISTIC_TIERED":
    case "OFFCHAIN_OPTIMISTIC_TIERED":
      normalizedProposal = normalizeOptimisticTieredProposal(
        archiveProposal,
        base,
        proposalType
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
