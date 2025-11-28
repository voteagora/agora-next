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
function extractChoicesFromDaoNode(
  decodedProposalData: unknown[][] | undefined
): { choices: string[]; maxApprovals: number; criteriaValue: number } {
  let choices: string[] = [];
  let maxApprovals = 0;
  let criteriaValue = 0;

  if (Array.isArray(decodedProposalData)) {
    // decoded_proposal_data[0] is array of options
    const optionsArray = decodedProposalData[0];
    if (Array.isArray(optionsArray)) {
      choices = optionsArray.map((opt: unknown, idx: number) => {
        const optArr = opt as unknown[];
        return typeof optArr?.[4] === "string"
          ? optArr[4]
          : `Option ${idx + 1}`;
      });
    }

    // decoded_proposal_data[1] contains [maxApprovals, criteria, address, criteriaValue, ...]
    const settingsArray = decodedProposalData[1];
    if (Array.isArray(settingsArray)) {
      maxApprovals = Number(settingsArray[0]) || 0;
      criteriaValue = Number(settingsArray[3]) || 0;
    }
  }

  return { choices, maxApprovals, criteriaValue };
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

  let choices: string[] = [];
  let maxApprovals = 0;
  let criteriaValue = 0;

  // Extract choices based on source
  if (isDaoNodeSource(proposal)) {
    const decoded = extractChoicesFromDaoNode(
      proposal.decoded_proposal_data as unknown[][] | undefined
    );
    choices = decoded.choices;
    maxApprovals = decoded.maxApprovals;
    criteriaValue = decoded.criteriaValue;
  } else if ("choices" in votingData && Array.isArray(votingData.choices)) {
    // eas-atlas/eas-oodao format: choices is a string array
    choices = votingData.choices as string[];
    maxApprovals =
      ("max_approvals" in votingData && Number(votingData.max_approvals)) || 0;
    criteriaValue =
      ("criteria_value" in votingData && Number(votingData.criteria_value)) ||
      0;
  }

  // Extract votes from outcome or totals
  const outcome = ("outcome" in votingData && votingData.outcome) || {};
  const totals = ("totals" in votingData && votingData.totals) || {};
  const totalVoters =
    ("num_of_votes" in votingData && votingData.num_of_votes) || 0;

  // Extract approval votes per option
  const approvalVotesMap: Record<string, number> = {};

  if (source !== "eas-atlas" && source !== "eas-oodao") {
    // dao_node format: totals[optionIndex]["1"] = approval votes
    Object.entries(totals)
      .filter(([key]) => key !== "no-param")
      .forEach(([param, votes]) => {
        const voteObj = votes as Record<string, string>;
        approvalVotesMap[param] = convertToNumber(
          String(voteObj["1"] ?? "0"),
          tokenDecimals
        );
      });
  }

  // Build choices with approvals
  const choicesWithApprovals: ApprovalChoice[] = choices.map(
    (choice, index) => {
      let approvals = 0;

      if (source === "eas-atlas" || source === "eas-oodao") {
        approvals = aggregateApprovalVotes(
          outcome as Record<string, unknown>,
          index.toString()
        );
      } else {
        approvals = approvalVotesMap[index.toString()] || 0;
      }

      return {
        index,
        text: choice,
        approvals,
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
    criteriaValue,
    totalVoters,
  };
}
