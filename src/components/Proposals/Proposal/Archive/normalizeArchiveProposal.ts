import { ArchiveListProposal } from "@/lib/types/archiveProposal";
import {
  STATUS_LABEL_MAP,
  convertToNumber,
  toDate,
  deriveTimeStatus,
  deriveStatus,
  deriveTypeLabel,
} from "./archiveProposalUtils";

export type ArchiveProposalMetrics = {
  kind: "standard";
  forRaw: string;
  againstRaw: string;
  abstainRaw: string;
  segments: {
    forPercentage: number;
    againstPercentage: number;
    abstainPercentage: number;
  };
  hasVotes: boolean;
};

export type ArchiveProposalDisplay = {
  id: string;
  href: string;
  title: string;
  typeLabel: string;
  proposerAddress: string;
  proposerEns?: string;
  statusLabel: string;
  tags?: string[];
  source?: string;
  timeStatus: {
    proposalStatus: string;
    proposalStartTime: Date | null;
    proposalEndTime: Date | null;
    proposalCancelledTime: Date | null;
    proposalExecutedTime: Date | null;
  };
  metrics: ArchiveProposalMetrics;
};

type NormalizeOptions = {
  namespace?: string | null;
  tokenDecimals?: number;
};

// Re-export shared utilities for backward compatibility
export {
  STATUS_LABEL_MAP,
  convertToNumber,
  toDate,
  deriveTimeStatus,
  deriveStatus,
};

const ensurePercentage = (value: number) => {
  if (!Number.isFinite(value) || value < 0) return 0;
  if (value > 100) return 100;
  return value;
};

const TEN_DAYS_IN_SECONDS = 10 * 24 * 60 * 60;

// Default thresholds if not specified in proposal type
const DEFAULT_QUORUM_PERCENT = 4;
const DEFAULT_APPROVAL_THRESHOLD_PERCENT = 50;

/**
 * Extract quorum and approval threshold from proposal type
 * Returns percentages (0-100)
 */
const extractThresholds = (
  proposalType: ArchiveListProposal["proposal_type"]
): { quorum: number; approvalThreshold: number } => {
  // Handle FixedProposalType (eas-oodao)
  if (
    typeof proposalType === "object" &&
    proposalType !== null &&
    "quorum" in proposalType
  ) {
    return {
      quorum: proposalType.quorum / 100, // Convert basis points to percentage
      approvalThreshold: proposalType.approval_threshold / 100,
    };
  }

  // Handle RangeProposalType (eas-oodao) - use max values
  if (
    typeof proposalType === "object" &&
    proposalType !== null &&
    "max_quorum_pct" in proposalType
  ) {
    return {
      quorum: proposalType.min_quorum_pct / 100,
      approvalThreshold: proposalType.min_approval_threshold_pct / 100,
    };
  }

  // Handle number type (dao_node) or unknown - use defaults
  return {
    quorum: DEFAULT_QUORUM_PERCENT,
    approvalThreshold: DEFAULT_APPROVAL_THRESHOLD_PERCENT,
  };
};

/**
 * Extract proposal type name from proposal_type field
 * Returns the name if available, otherwise "Standard"
 */
const getProposalTypeName = (
  proposalType: ArchiveListProposal["proposal_type"]
): string => {
  // FixedProposalType has a name field
  if (
    typeof proposalType === "object" &&
    proposalType !== null &&
    "name" in proposalType &&
    proposalType.name
  ) {
    return proposalType.name;
  }

  // RangeProposalType or number - default to "Standard"
  return "Standard";
};

export const formatArchiveTagLabel = (tag?: string | null): string | null => {
  if (!tag) {
    return null;
  }

  const normalized = tag.toLowerCase();
  if (normalized === "tempcheck" || normalized === "temp-check") {
    return "Temp Check";
  }

  return tag;
};

export function normalizeArchiveProposal(
  proposal: ArchiveListProposal,
  options: NormalizeOptions = {}
): ArchiveProposalDisplay {
  const decimals = options.tokenDecimals ?? 18;
  const status = deriveStatus(proposal, decimals);
  const normalizedStatus = STATUS_LABEL_MAP[status] ? status : "UNKNOWN";
  const typeLabel = deriveTypeLabel(proposal);

  // Handle different data sources: EAS-OODAO vs standard
  const source = proposal.data_eng_properties?.source;
  const voteTotals =
    source === "eas-oodao"
      ? proposal.outcome?.["token-holders"] || {}
      : proposal.totals?.["no-param"] || {};

  const forVotesRaw = voteTotals["1"] ?? "0";
  const againstVotesRaw = voteTotals["0"] ?? "0";
  const abstainVotesRaw = voteTotals["2"] ?? "0";

  const forVotes = convertToNumber(forVotesRaw, decimals);
  const againstVotes = convertToNumber(againstVotesRaw, decimals);
  const abstainVotes = convertToNumber(abstainVotesRaw, decimals);
  const totalVotes = forVotes + againstVotes + abstainVotes;

  const voteMetrics: ArchiveProposalMetrics = {
    kind: "standard",
    forRaw: forVotesRaw,
    againstRaw: againstVotesRaw,
    abstainRaw: abstainVotesRaw,
    segments:
      totalVotes > 0
        ? {
            forPercentage: ensurePercentage((forVotes / totalVotes) * 100),
            abstainPercentage: ensurePercentage(
              (abstainVotes / totalVotes) * 100
            ),
            againstPercentage: ensurePercentage(
              (againstVotes / totalVotes) * 100
            ),
          }
        : {
            forPercentage: 0,
            abstainPercentage: 0,
            againstPercentage: 0,
          },
    hasVotes: totalVotes > 0,
  };

  const metrics: ArchiveProposalMetrics = voteMetrics;

  const title = proposal.title || "Untitled Proposal";

  return {
    id: proposal.id,
    href: `/proposals/${proposal.id}`,
    title,
    typeLabel,
    tags: Array.isArray(proposal.tags) ? proposal.tags : undefined,
    source: proposal.data_eng_properties?.source,
    proposerAddress: proposal.proposer,
    proposerEns:
      typeof proposal.proposer_ens === "string"
        ? proposal.proposer_ens
        : proposal.proposer_ens?.detail,
    statusLabel: STATUS_LABEL_MAP[normalizedStatus],
    timeStatus: deriveTimeStatus(proposal, normalizedStatus),
    metrics,
  };
}

export function normalizeArchiveProposals(
  proposals: ArchiveListProposal[],
  options: NormalizeOptions = {}
) {
  return proposals.map((proposal) =>
    normalizeArchiveProposal(proposal, options)
  );
}
