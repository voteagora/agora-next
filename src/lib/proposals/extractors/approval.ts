/**
 * Approval vote extraction functions
 *
 * Handles extraction of multi-choice approval votes from all sources:
 * - dao_node: choices from decoded_proposal_data, votes from totals
 * - eas-atlas/eas-oodao: choices array, votes from outcome
 */

import { CITIZEN_TYPES } from "@/lib/constants";
import type { EasAtlasVoteOutcome } from "@/lib/types/archiveProposal";
import type {
  ArchiveProposalInput,
  ApprovalChoice,
  ApprovalMetrics,
  ExtractorOptions,
} from "./types";
import {
  isDaoNodeSource,
  isEasAtlasSource,
  isEasOodaoSource,
  getVotingData,
} from "./guards";
import { convertToNumber, ensurePercentage } from "./standard";

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Safely convert a value to BigInt, handling scientific notation
 */
function safeBigInt(value: unknown): bigint {
  if (value === null || value === undefined) return 0n;
  if (typeof value === "bigint") return value;
  if (typeof value === "number") {
    // Handle scientific notation by converting to fixed-point string
    if (!Number.isFinite(value)) return 0n;
    return BigInt(Math.floor(value));
  }
  if (typeof value === "string") {
    // Handle scientific notation in strings (e.g., "1.77068e+25")
    if (value.includes("e") || value.includes("E")) {
      const num = Number(value);
      if (!Number.isFinite(num)) return 0n;
      return BigInt(Math.floor(num));
    }
    // Handle decimal strings
    if (value.includes(".")) {
      return BigInt(Math.floor(Number(value)));
    }
    try {
      return BigInt(value);
    } catch {
      return 0n;
    }
  }
  return 0n;
}

/**
 * Aggregate approval votes across citizen types for a specific choice
 */
function aggregateApprovalVotes(
  outcome: Record<string, unknown>,
  choiceIndex: string
): number {
  let total = 0;
  for (const type of CITIZEN_TYPES) {
    const typeOutcome = outcome?.[type] as
      | Record<string, Record<string, number>>
      | undefined;
    total += Number(typeOutcome?.[choiceIndex]?.["1"] ?? 0);
  }
  return total;
}

/**
 * Extract choices from dao_node decoded_proposal_data
 */
type DecodedApprovalData = {
  choices: ApprovalChoice[];
  maxApprovals: number;
  criteria: number;
  criteriaValue: bigint;
  budgetToken: string;
  budgetAmount: bigint;
  options: {
    targets: string[];
    values: string[];
    calldatas: string[];
    description: string;
    budgetTokensSpent: bigint | null;
  }[];
};

function extractChoicesFromDaoNode(
  decodedProposalData: unknown[][] | undefined
): DecodedApprovalData {
  let choices: ApprovalChoice[] = [];
  let maxApprovals = 0;
  let criteria = 0;
  let criteriaValue = 0n;
  let budgetToken = "";
  let budgetAmount = 0n;
  const options: DecodedApprovalData["options"] = [];

  if (Array.isArray(decodedProposalData)) {
    // decoded_proposal_data[0] is array of options
    // Each option: [targets[], values[], calldatas[], ?, description, budgetTokensSpent?]
    const optionsArray = decodedProposalData[0];
    if (Array.isArray(optionsArray)) {
      optionsArray.forEach((opt: unknown, idx: number) => {
        const optArr = opt as unknown[];
        const description =
          typeof optArr?.[4] === "string" ? optArr[4] : `Option ${idx + 1}`;
        const budgetTokensSpent = optArr?.[5]
          ? BigInt(String(optArr[5]))
          : null;

        choices.push({
          index: idx,
          text: description,
          approvals: 0,
          percentage: 0,
        });

        options.push({
          targets: Array.isArray(optArr?.[0]) ? optArr[0] : [],
          values: Array.isArray(optArr?.[1])
            ? optArr[1].map((v: unknown) => String(v))
            : [],
          calldatas: Array.isArray(optArr?.[2])
            ? optArr[2].map((c: unknown) =>
                String(c).startsWith("0x") ? String(c) : `0x${String(c)}`
              )
            : [],
          description,
          budgetTokensSpent,
        });
      });
    }

    // decoded_proposal_data[1] contains [maxApprovals, criteria, budgetToken, criteriaValue, budgetAmount]
    const settingsArray = decodedProposalData[1];
    if (Array.isArray(settingsArray)) {
      maxApprovals = Number(settingsArray[0]) || 0;
      criteria = Number(settingsArray[1]) || 0;
      budgetToken =
        typeof settingsArray[2] === "string" ? settingsArray[2] : "";
      criteriaValue = safeBigInt(settingsArray[3]);
      budgetAmount = safeBigInt(settingsArray[4]);
    }
  }

  return {
    choices,
    maxApprovals,
    criteria,
    criteriaValue,
    budgetToken,
    budgetAmount,
    options,
  };
}

// =============================================================================
// Main Extractor
// =============================================================================

/**
 * Extract approval voting metrics from any proposal source.
 *
 * Handles:
 * - dao_node: votes from totals[optionIndex]["1"]
 * - eas-atlas/eas-oodao: aggregated citizen votes
 */
export function extractApprovalMetrics(
  proposal: ArchiveProposalInput,
  options: ExtractorOptions
): ApprovalMetrics {
  const { tokenDecimals } = options;
  const votingData = getVotingData(proposal);
  const source = proposal.data_eng_properties?.source;

  let decodedData: DecodedApprovalData | null = null;
  let choices: string[] = [];
  let maxApprovals = 0;
  let criteria = 0;
  let criteriaValue = 0n;
  let budgetToken = "";
  let budgetAmount = 0n;

  // Extract choices based on source
  if (isDaoNodeSource(proposal)) {
    decodedData = extractChoicesFromDaoNode(
      proposal.decoded_proposal_data as unknown[][] | undefined
    );
    choices = decodedData.choices.map((c) => c.text);
    maxApprovals = decodedData.maxApprovals;
    criteria = decodedData.criteria;
    criteriaValue = decodedData.criteriaValue;
    budgetToken = decodedData.budgetToken;
    budgetAmount = decodedData.budgetAmount;
  } else if ("choices" in votingData && Array.isArray(votingData.choices)) {
    // eas-atlas/eas-oodao format: choices is a string array
    choices = votingData.choices as string[];
    maxApprovals =
      ("max_approvals" in votingData && Number(votingData.max_approvals)) || 0;
    criteria = ("criteria" in votingData && Number(votingData.criteria)) || 0;
    criteriaValue = BigInt(
      ("criteria_value" in votingData && String(votingData.criteria_value)) ||
        "0"
    );
    budgetToken =
      ("budget_token" in votingData && String(votingData.budget_token)) || "";
    budgetAmount = BigInt(
      ("budget_amount" in votingData && String(votingData.budget_amount)) || "0"
    );
  }

  // Extract votes from outcome or totals
  const outcome = ("outcome" in votingData && votingData.outcome) || {};
  const totals = ("totals" in votingData && votingData.totals) || {};
  const totalVoters =
    ("num_of_votes" in votingData && votingData.num_of_votes) || 0;

  // Extract approval votes per option
  const approvalVotesMap: Record<string, number> = {};
  const approvalVotesRawMap: Record<string, bigint> = {};

  if (source !== "eas-atlas" && source !== "eas-oodao") {
    // dao_node format: totals[optionIndex] contains votes
    // Try key "1" first (newer format), then key "0" (older format where "0" = approval votes)
    Object.entries(totals)
      .filter(([key]) => key !== "no-param")
      .forEach(([param, votes]) => {
        const voteObj = votes as Record<string, string>;
        // Check for votes under key "1" first, then "0"
        const voteValue = voteObj["1"] ?? voteObj["0"] ?? "0";
        // Store both raw BigInt and converted number
        approvalVotesRawMap[param] = BigInt(voteValue);
        approvalVotesMap[param] = convertToNumber(
          String(voteValue),
          tokenDecimals
        );
      });
  }

  // Build choices with approvals
  const choicesWithApprovals: ApprovalChoice[] = choices.map(
    (choice, index) => {
      let approvals = 0;
      let approvalsRaw: bigint | undefined;

      if (source === "eas-atlas" || source === "eas-oodao") {
        approvals = aggregateApprovalVotes(
          outcome as Record<string, unknown>,
          index.toString()
        );
      } else {
        approvals = approvalVotesMap[index.toString()] || 0;
        approvalsRaw = approvalVotesRawMap[index.toString()];
      }

      return {
        index,
        text: choice,
        approvals,
        approvalsRaw,
        percentage: 0,
      };
    }
  );
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

  return {
    choices: choicesWithApprovals,
    maxApprovals,
    criteria,
    criteriaValue,
    budgetToken,
    budgetAmount,
    totalVoters,
    options: decodedData?.options ?? [],
  };
}
