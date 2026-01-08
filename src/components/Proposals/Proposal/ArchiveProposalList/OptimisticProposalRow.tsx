"use client";

import { useMemo } from "react";
import { ArchiveListProposal } from "@/lib/types/archiveProposal";
import Tenant from "@/lib/tenant/tenant";
import { OPOptimisticStatusView } from "../OPOptimisticProposalStatus";
import { BaseRowLayout } from "./BaseRowLayout";
import { ArchiveRowProps } from "./types";
import { extractDisplayData } from "./utils";
import { extractThresholds } from "../Archive/archiveProposalUtils";

/**
 * Extract optimistic voting data from proposal
 * For archive proposals, we derive status from lifecycle_stage
 */
function extractOptimisticData(proposal: ArchiveListProposal): {
  againstRelativeAmount: number;
  disapprovalThreshold: number;
  status: string;
} {
  // Default disapproval threshold (can be overridden by kwargs if available)
  const thresholds = extractThresholds(proposal);

  const disapprovalThreshold = thresholds.approvalThreshold;

  // Calculate against percentage from outcome if available
  let againstRelativeAmount = 0;

  // For eas-oodao, outcome is in token-holders format
  const outcome = proposal.outcome as
    | { "token-holders"?: { "0"?: string; "1"?: string; "2"?: string } }
    | undefined;
  const tokenHolderOutcome = outcome?.["token-holders"];

  if (tokenHolderOutcome) {
    const againstVotes = Number(tokenHolderOutcome["0"] ?? 0);
    const forVotes = Number(tokenHolderOutcome["1"] ?? 0);
    const totalVotes = againstVotes + forVotes;

    if (totalVotes > 0) {
      againstRelativeAmount = Math.round((againstVotes / totalVotes) * 100);
    }
  }

  // Derive status from lifecycle_stage
  let status = "Pending";
  const lifecycleStage = proposal.lifecycle_stage?.toUpperCase();

  if (lifecycleStage === "EXECUTED" || lifecycleStage === "SUCCEEDED") {
    status = "Approved";
  } else if (lifecycleStage === "CANCELLED") {
    status = "Cancelled";
  } else {
    status =
      againstRelativeAmount >= disapprovalThreshold ? "Defeated" : "Approved";
  }

  return {
    againstRelativeAmount,
    disapprovalThreshold,
    status,
  };
}

/**
 * Row component for OPTIMISTIC proposals from archive
 */
export function OptimisticProposalRow({
  proposal,
  tokenDecimals,
  proposalType = "OPTIMISTIC",
}: ArchiveRowProps) {
  const { token } = Tenant.current();
  const decimals = tokenDecimals ?? token.decimals ?? 18;

  // Compute display data and optimistic metrics
  const { displayData, optimisticData } = useMemo(() => {
    const displayData = extractDisplayData(proposal, proposalType, decimals);
    const optimisticData = extractOptimisticData(proposal);
    return { displayData, optimisticData };
  }, [proposal, decimals, proposalType]);

  // Render optimistic status view
  const metricsContent = (
    <OPOptimisticStatusView
      againstRelativeAmount={optimisticData.againstRelativeAmount}
      disapprovalThreshold={optimisticData.disapprovalThreshold}
      status={optimisticData.status}
    />
  );

  return <BaseRowLayout data={displayData} metricsContent={metricsContent} />;
}

export default OptimisticProposalRow;
