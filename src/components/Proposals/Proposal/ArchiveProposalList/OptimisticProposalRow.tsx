"use client";

import { useMemo } from "react";
import {
  ArchiveListProposal,
  FixedProposalType,
} from "@/lib/types/archiveProposal";
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

  const disapprovalThreshold = thresholds.quorum;

  // Calculate against percentage from outcome if available
  let againstRelativeAmount = 0;

  // For eas-oodao, outcome is in token-holders format
  const outcome = proposal.outcome as
    | { "token-holders"?: { "0"?: string; "1"?: string; "2"?: string } }
    | undefined;
  const tokenHolderOutcome = outcome?.["token-holders"];

  if (tokenHolderOutcome) {
    const againstVotes = Number(tokenHolderOutcome["0"] ?? 0);
    const votableSupply = Number(proposal.total_voting_power_at_start);
    againstRelativeAmount = Number(
      ((againstVotes / votableSupply) * 100).toFixed(2)
    );
  }

  // Derive status from lifecycle_stage
  let status = "Pending";
  const lifecycleStage = proposal.lifecycle_stage?.toUpperCase();
  console.log(lifecycleStage);
  if (lifecycleStage === "EXECUTED" || lifecycleStage === "SUCCEEDED") {
    status = "Approved";
  } else if (lifecycleStage === "CANCELLED") {
    status = "Cancelled";
  } else if (lifecycleStage === "DEFEATED") {
    status = "Defeated";
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
  const { displayData, optimisticData, proposalTypeName } = useMemo(() => {
    const displayData = extractDisplayData(proposal, proposalType, decimals);
    const optimisticData = extractOptimisticData(proposal);
    const proposalTypeName =
      (proposal.proposal_type as FixedProposalType)?.name ?? proposalType;
    return { displayData, optimisticData, proposalTypeName };
  }, [proposal, decimals, proposalType]);

  // Render optimistic status view
  const metricsContent = (
    <OPOptimisticStatusView
      againstRelativeAmount={optimisticData.againstRelativeAmount}
      disapprovalThreshold={optimisticData.disapprovalThreshold}
      status={optimisticData.status}
    />
  );

  return (
    <BaseRowLayout
      data={displayData}
      metricsContent={metricsContent}
      proposalTypeName={proposalTypeName}
    />
  );
}

export default OptimisticProposalRow;
