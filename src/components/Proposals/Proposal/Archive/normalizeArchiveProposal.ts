import {
  ArchiveListProposal,
  deriveProposalType,
  parseArchiveProposalResults,
  getArchiveProposalStatus,
  ArchiveProposalStatus,
  ArchiveParsedProposalResults,
  GovlessProposal,
} from "@/lib/types/archiveProposal";
import {
  STATUS_LABEL_MAP,
  convertToNumber,
  toDate,
  deriveTimeStatus,
  deriveStatus,
  deriveProposalTag,
} from "./archiveProposalUtils";
import { getProposalTypeText } from "@/lib/utils";
import { ProposalType } from "@/lib/types";
import { HYBRID_VOTE_WEIGHTS, OFFCHAIN_THRESHOLDS } from "@/lib/constants";

export type ArchiveProposalMetrics =
  | {
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
    }
  | {
      kind: "approval";
      choices: {
        index: number;
        text: string;
        approvals: number;
        percentage: number;
      }[];
      maxApprovals: number;
      criteriaValue: number;
      totalVoters: number;
    }
  | {
      kind: "optimistic";
      againstCount: number;
      againstPercentage: number;
      defeatThreshold: number;
      isDefeated: boolean;
    }
  | {
      kind: "optimistic-tiered";
      againstCount: number;
      supportCount: number;
      againstPercentage: number;
      tiers: number[]; // basis points
      currentTier: number;
      isDefeated: boolean;
    };

export type ArchiveProposalDisplay = {
  id: string;
  href: string;
  title: string;
  proposalTypeTag: string;
  proposerAddress: string;
  proposerEns?: string;
  statusLabel: string;
  tags?: string[];
  source?: string;
  defaultProposalTypeRanges?: {
    min_quorum_pct: number;
    max_quorum_pct: number;
    min_approval_threshold_pct: number;
    max_approval_threshold_pct: number;
  };
  timeStatus: {
    proposalStatus: string;
    proposalStartTime: Date | null;
    proposalEndTime: Date | null;
    proposalCancelledTime: Date | null;
    proposalExecutedTime: Date | null;
  };
  metrics: ArchiveProposalMetrics;
  proposalTypeName: string;
  proposalTypeApproval?: string;
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

/**
 * Get voting data source - for hybrid proposals, use govless_proposal
 */
function getVotingData(
  proposal: ArchiveListProposal
): ArchiveListProposal | GovlessProposal {
  return proposal.hybrid && proposal.govless_proposal
    ? proposal.govless_proposal
    : proposal;
}

// Helper to aggregate votes across citizen types (USER, APP, CHAIN)
const CITIZEN_TYPES = ["USER", "APP", "CHAIN"] as const;

const aggregateVotes = (
  outcome: any,
  key: string | number,
  subKey?: string
): number => {
  let total = 0;

  for (const type of CITIZEN_TYPES) {
    if (outcome?.[type]) {
      if (subKey) {
        // For approval votes: outcome.USER["0"]["1"]
        total += Number(outcome[type]?.[key]?.[subKey] ?? 0);
      } else {
        // For standard/optimistic votes: outcome.USER["0"]
        total += Number(outcome[type]?.[key] ?? 0);
      }
    }
  }

  return total;
};

type MetricsContext = {
  proposal: ArchiveListProposal;
  /** Voting data - can be proposal itself or govless_proposal for hybrid */
  votingData: ArchiveListProposal | GovlessProposal;
  status: string;
  proposalType: ProposalType;
  decimals: number;
  source?: string;
  /** Parsed results from parseArchiveProposalResults (optional, will compute if not provided) */
  parsedResults?: ArchiveParsedProposalResults[keyof ArchiveParsedProposalResults];
};

// Type guard to check if votingData is ArchiveListProposal (has dao_node fields)
function isArchiveListProposal(
  data: ArchiveListProposal | GovlessProposal
): data is ArchiveListProposal {
  return "id" in data && "data_eng_properties" in data;
}

export function getMetricsForProposal({
  proposal,
  votingData,
  status,
  proposalType,
  decimals,
  source,
  parsedResults,
}: MetricsContext): ArchiveProposalMetrics {
  // Use provided parsed results or compute them
  const results =
    parsedResults || parseArchiveProposalResults(proposal, proposalType);
  let metrics: ArchiveProposalMetrics;
  if (
    proposalType === "APPROVAL" ||
    proposalType === "HYBRID_APPROVAL" ||
    proposalType === "OFFCHAIN_APPROVAL"
  ) {
    // APPROVAL: Multiple choices with approval voting
    // For dao_node source, choices come from decoded_proposal_data
    // For eas-atlas/eas-oodao, choices come from votingData.choices
    let choices: string[] = [];
    // Use type assertion for fields that may not exist on GovlessProposal
    const vd = votingData as ArchiveListProposal;
    let maxApprovals = vd.max_approvals || 0;
    let criteriaValue = vd.criteria_value || 0;

    if (Array.isArray(vd.choices)) {
      // eas-atlas/eas-oodao format: choices is a string array
      choices = vd.choices as string[];
    } else if (Array.isArray(vd.decoded_proposal_data)) {
      // dao_node format (same as adaptDAONodeResponse):
      // decoded_proposal_data[0] is array of options
      // Each option is [budgetTokensSpent, targets, values, calldatas, description]
      const optionsArray = vd.decoded_proposal_data[0];
      if (Array.isArray(optionsArray)) {
        choices = optionsArray.map((opt: unknown, idx: number) => {
          // The description/name is at index 4
          const optArr = opt as unknown[];
          return typeof optArr[4] === "string"
            ? optArr[4]
            : `Option ${idx + 1}`;
        });
      }
      // decoded_proposal_data[1] contains [maxApprovals, criteria, address, criteriaValue, ...]
      const settingsArray = vd.decoded_proposal_data[1];
      if (Array.isArray(settingsArray)) {
        maxApprovals = Number(settingsArray[0]) || maxApprovals;
        // criteriaValue is at index 3
        criteriaValue = Number(settingsArray[3]) || criteriaValue;
      }
    }

    const outcome: Record<string, unknown> = vd.outcome || {};
    const totalVoters = vd.num_of_votes || 0;
    const totals = vd.totals || {};

    // Extract approval votes per option (same pattern as adaptDAONodeResponse)
    // dao_node format: totals[optionIndex]["1"] = approval votes for that option
    // Filter out "no-param" key and use numeric keys as option indices
    const approvalVotesMap: Record<string, number> = {};
    if (source !== "eas-atlas" && source !== "eas-oodao") {
      Object.entries(totals)
        .filter(([key]) => key !== "no-param")
        .forEach(([param, votes]) => {
          const voteObj = votes as Record<string, string>;
          approvalVotesMap[param] = convertToNumber(
            String(voteObj["1"] ?? "0"),
            decimals
          );
        });
    }

    const choicesWithApprovals = choices.map((choice, index) => {
      let approvals = 0;

      if (source === "eas-atlas" || source === "eas-oodao") {
        // Aggregate approvals across citizen types for this choice
        approvals = aggregateVotes(outcome, index.toString(), "1");
      } else {
        // dao_node format: use pre-computed map
        approvals = approvalVotesMap[index.toString()] || 0;
      }

      return {
        index,
        text: choice,
        approvals,
        percentage: 0, // Will calculate after we have total
      };
    });

    // Calculate percentages
    const totalApprovals = choicesWithApprovals.reduce(
      (sum, c) => sum + c.approvals,
      0
    );
    choicesWithApprovals.forEach((choice) => {
      choice.percentage =
        totalApprovals > 0
          ? ensurePercentage((choice.approvals / totalApprovals) * 100)
          : 0;
    });

    // Sort by approvals (highest first)
    choicesWithApprovals.sort((a, b) => b.approvals - a.approvals);

    metrics = {
      kind: "approval",
      choices: choicesWithApprovals,
      maxApprovals,
      criteriaValue,
      totalVoters,
    };
  } else if (proposalType === "OPTIMISTIC") {
    // OPTIMISTIC (non-hybrid): Use parsed results
    const optimisticResults =
      results as ArchiveParsedProposalResults["OPTIMISTIC"];
    const againstVotes = optimisticResults.kind.against;
    const againstCount = convertToNumber(againstVotes.toString(), decimals);
    const defeatThreshold = 17; // Standard 17% threshold

    // Calculate percentage based on quorum (delegate threshold)
    let againstPercentage = 0;
    if (proposal.quorum) {
      const quorumValue = convertToNumber(String(proposal.quorum), decimals);
      againstPercentage =
        quorumValue > 0
          ? Math.round((againstCount / quorumValue) * 100 * 10) / 10
          : 0;
    }

    const isDefeated = status === "DEFEATED";

    metrics = {
      kind: "optimistic",
      againstCount,
      againstPercentage,
      defeatThreshold,
      isDefeated,
    };
  } else if (
    proposalType === "HYBRID_OPTIMISTIC" ||
    proposalType === "OFFCHAIN_OPTIMISTIC" ||
    proposalType === "HYBRID_OPTIMISTIC_TIERED" ||
    proposalType === "OFFCHAIN_OPTIMISTIC_TIERED"
  ) {
    // HYBRID/OFFCHAIN OPTIMISTIC: Uses weighted citizen percentages
    const vd = votingData as ArchiveListProposal;
    const outcome = (vd.outcome || {}) as Record<
      string,
      Record<string, number>
    >;
    const againstCount = aggregateVotes(outcome, "0");
    const supportCount = aggregateVotes(outcome, "2");
    const tiers = Array.isArray(vd.tiers) ? vd.tiers : [];
    const defeatThreshold = 17; // Standard 17% threshold

    let weightedAgainstPercentage = 0;

    // Calculate offchain citizen percentages with weights
    const userAgainst = Number(outcome?.["USER"]?.["0"] ?? 0);
    const appAgainst = Number(outcome?.["APP"]?.["0"] ?? 0);
    const chainAgainst = Number(outcome?.["CHAIN"]?.["0"] ?? 0);

    // For hybrid proposals, also account for onchain delegates
    if (proposal.hybrid && proposal.quorum) {
      const onchainAgainst = Number(proposal.totals?.["no-param"]?.["0"] ?? 0);
      // Calculate eligible delegates: quorum is 30% of total, so multiply by (100/30)
      const eligibleDelegates = Number(proposal.quorum) * (100 / 30);
      weightedAgainstPercentage +=
        (onchainAgainst / eligibleDelegates) *
        HYBRID_VOTE_WEIGHTS.delegates *
        100;
      weightedAgainstPercentage +=
        (appAgainst / OFFCHAIN_THRESHOLDS.APP) * HYBRID_VOTE_WEIGHTS.apps * 100;
      weightedAgainstPercentage +=
        (userAgainst / OFFCHAIN_THRESHOLDS.USER) *
        HYBRID_VOTE_WEIGHTS.users *
        100;
      weightedAgainstPercentage +=
        (chainAgainst / OFFCHAIN_THRESHOLDS.CHAIN) *
        HYBRID_VOTE_WEIGHTS.chains *
        100;
    } else {
      // For offchain-only, sum percentages and divide by 3 (no weights)
      weightedAgainstPercentage =
        ((userAgainst / OFFCHAIN_THRESHOLDS.USER) * 100 +
          (appAgainst / OFFCHAIN_THRESHOLDS.APP) * 100 +
          (chainAgainst / OFFCHAIN_THRESHOLDS.CHAIN) * 100) /
        3;
    }

    const againstPercentage = Math.round(weightedAgainstPercentage * 10) / 10;
    const isDefeated = status === "DEFEATED";

    // Tiered variants include tier info for UI display
    if (
      proposalType === "HYBRID_OPTIMISTIC_TIERED" ||
      proposalType === "OFFCHAIN_OPTIMISTIC_TIERED"
    ) {
      const currentTier = tiers.length > 0 ? tiers[tiers.length - 1] : 1700;
      metrics = {
        kind: "optimistic-tiered",
        againstCount,
        supportCount,
        againstPercentage,
        tiers,
        currentTier,
        isDefeated,
      };
    } else {
      metrics = {
        kind: "optimistic",
        againstCount,
        againstPercentage,
        defeatThreshold,
        isDefeated,
      };
    }
  } else {
    // STANDARD: For/Against/Abstain voting
    const vd = votingData as ArchiveListProposal;
    const votingSource =
      proposal.hybrid && proposal.govless_proposal
        ? proposal.govless_proposal.data_eng_properties?.source
        : source;
    let forVotes: number, againstVotes: number, abstainVotes: number;
    let forVotesRaw: string, againstVotesRaw: string, abstainVotesRaw: string;

    if (votingSource === "eas-atlas" || votingSource === "eas-oodao") {
      // Aggregate across citizen types from outcome
      const outcome = vd.outcome || {};
      forVotes = aggregateVotes(outcome, "1");
      againstVotes = aggregateVotes(outcome, "0");
      abstainVotes = aggregateVotes(outcome, "2");

      forVotesRaw = forVotes.toString();
      againstVotesRaw = againstVotes.toString();
      abstainVotesRaw = abstainVotes.toString();
    } else {
      // dao_node format: already aggregated
      const voteTotals = vd.totals?.["no-param"] || {};
      const forVal = voteTotals["1"];
      const againstVal = voteTotals["0"];
      const abstainVal = voteTotals["2"];

      forVotesRaw = typeof forVal === "string" ? forVal : String(forVal ?? "0");
      againstVotesRaw =
        typeof againstVal === "string" ? againstVal : String(againstVal ?? "0");
      abstainVotesRaw =
        typeof abstainVal === "string" ? abstainVal : String(abstainVal ?? "0");

      forVotes = convertToNumber(forVotesRaw, decimals);
      againstVotes = convertToNumber(againstVotesRaw, decimals);
      abstainVotes = convertToNumber(abstainVotesRaw, decimals);
    }

    const totalVotes = forVotes + againstVotes + abstainVotes;

    metrics = {
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
  }

  return metrics;
}

export function normalizeArchiveProposal(
  proposal: ArchiveListProposal,
  options: NormalizeOptions = {}
): ArchiveProposalDisplay {
  const decimals = options.tokenDecimals ?? 18;
  const status = deriveStatus(proposal, decimals);
  const normalizedStatus = STATUS_LABEL_MAP[status] ? status : "UNKNOWN";
  const proposalTag = deriveProposalTag(proposal);
  const source = proposal.data_eng_properties?.source;

  // For hybrid proposals, use govless_proposal data for voting/metrics
  const votingData =
    proposal.hybrid && proposal.govless_proposal
      ? proposal.govless_proposal
      : proposal;

  // Determine proposal type using the new deriveProposalType function
  const proposalType = deriveProposalType(proposal);
  const proposalTypeName = getProposalTypeText(proposalType);

  // Parse results for use in metrics calculation
  const parsedResults = parseArchiveProposalResults(proposal, proposalType);

  // let metrics: ArchiveProposalMetrics;

  // Handle different proposal types (check for approval variants)
  const metrics = getMetricsForProposal({
    proposal,
    votingData,
    status,
    proposalType,
    decimals,
    source,
    parsedResults,
  });

  const title = proposal.title || "Untitled Proposal";

  // For hybrid proposals, use onchain proposer (not offchain attester)
  // For pure offchain (eas-atlas only), use attester
  const proposerAddress =
    proposal.proposer ||
    proposal.govless_proposal?.attester ||
    proposal.govless_proposal?.proposer ||
    "";

  const proposerEns = proposal.proposer_ens
    ? typeof proposal.proposer_ens === "string"
      ? proposal.proposer_ens
      : (proposal.proposer_ens?.detail ?? undefined)
    : typeof proposal.govless_proposal?.proposer_ens === "string"
      ? proposal.govless_proposal.proposer_ens
      : (proposal.govless_proposal?.proposer_ens?.detail ?? undefined);

  return {
    id: proposal.id,
    href: `/proposals/${proposal.id}`,
    title,
    proposalTypeTag: proposalTag,
    tags: Array.isArray(proposal.tags) ? proposal.tags : undefined,
    source: proposal.data_eng_properties?.source,
    defaultProposalTypeRanges: proposal.default_proposal_type_ranges,
    proposerAddress,
    proposerEns,
    statusLabel: STATUS_LABEL_MAP[normalizedStatus],
    timeStatus: deriveTimeStatus(proposal, normalizedStatus),
    metrics,
    proposalTypeName,
    proposalTypeApproval: (votingData as ArchiveListProposal)
      .proposal_type_approval,
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
