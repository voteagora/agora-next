"use client";

import { useMemo } from "react";
import { ArchiveListProposal } from "@/lib/types/archiveProposal";
import Tenant from "@/lib/tenant/tenant";
import { OPApprovalArchiveStatusView } from "./OPApprovalArchiveStatusView";
import { BaseRowLayout } from "./BaseRowLayout";
import { ArchiveRowProps } from "./types";
import {
  extractDisplayData,
  getVotingData,
  convertToNumber,
  ensurePercentage,
} from "./utils";

// Citizen types for aggregating offchain votes
const CITIZEN_TYPES = ["USER", "APP", "CHAIN"] as const;

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

type ApprovalChoice = {
  index: number;
  text: string;
  approvals: number;
  percentage: number;
};

type ApprovalMetrics = {
  choices: ApprovalChoice[];
  maxApprovals: number;
  criteriaValue: number;
  totalVoters: number;
};

/**
 * Extract approval voting metrics from proposal
 */
function extractApprovalMetrics(
  proposal: ArchiveListProposal,
  decimals: number
): ApprovalMetrics {
  const votingData = getVotingData(proposal);
  const vd = votingData as ArchiveListProposal;
  const source = proposal.data_eng_properties?.source;

  let choices: string[] = [];
  let maxApprovals = vd.max_approvals || 0;
  let criteriaValue = vd.criteria_value || 0;

  // Extract choices based on source
  if (Array.isArray(vd.choices)) {
    // eas-atlas/eas-oodao format: choices is a string array
    choices = vd.choices as string[];
  } else if (Array.isArray(vd.decoded_proposal_data)) {
    // dao_node format: decoded_proposal_data[0] is array of options
    const optionsArray = vd.decoded_proposal_data[0];
    if (Array.isArray(optionsArray)) {
      choices = optionsArray.map((opt: unknown, idx: number) => {
        const optArr = opt as unknown[];
        return typeof optArr[4] === "string" ? optArr[4] : `Option ${idx + 1}`;
      });
    }
    // decoded_proposal_data[1] contains [maxApprovals, criteria, address, criteriaValue, ...]
    const settingsArray = vd.decoded_proposal_data[1];
    if (Array.isArray(settingsArray)) {
      maxApprovals = Number(settingsArray[0]) || maxApprovals;
      criteriaValue = Number(settingsArray[3]) || criteriaValue;
    }
  }

  const outcome: Record<string, unknown> = vd.outcome || {};
  const totalVoters = vd.num_of_votes || 0;
  const totals = vd.totals || {};

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
          decimals
        );
      });
  }

  // Build choices with approvals
  const choicesWithApprovals = choices.map((choice, index) => {
    let approvals = 0;

    if (source === "eas-atlas" || source === "eas-oodao") {
      approvals = aggregateApprovalVotes(outcome, index.toString());
    } else {
      approvals = approvalVotesMap[index.toString()] || 0;
    }

    return {
      index,
      text: choice,
      approvals,
      percentage: 0,
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

  return {
    choices: choicesWithApprovals,
    maxApprovals,
    criteriaValue,
    totalVoters,
  };
}

/**
 * Row component for APPROVAL, HYBRID_APPROVAL, OFFCHAIN_APPROVAL proposals
 */
export function ApprovalProposalRow({
  proposal,
  tokenDecimals,
}: ArchiveRowProps) {
  const { token } = Tenant.current();
  const decimals = tokenDecimals ?? token.decimals ?? 18;

  // Compute display data and metrics
  const { displayData, metrics } = useMemo(() => {
    const displayData = extractDisplayData(proposal, "APPROVAL", decimals);
    const metrics = extractApprovalMetrics(proposal, decimals);
    return { displayData, metrics };
  }, [proposal, decimals]);

  return (
    <BaseRowLayout
      data={displayData}
      metricsContent={
        <OPApprovalArchiveStatusView
          maxApprovals={metrics.maxApprovals}
          optionCount={metrics.choices.length}
        />
      }
    />
  );
}
