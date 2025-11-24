"use client";

import { useMemo } from "react";
import { ArchiveListProposal } from "@/lib/types/archiveProposal";
import Tenant from "@/lib/tenant/tenant";
import { OPOptimisticTieredArchiveStatusView } from "./OPOptimisticTieredArchiveStatusView";
import { BaseRowLayout } from "./BaseRowLayout";
import { ArchiveRowProps } from "./types";
import { extractDisplayData, getVotingData, deriveStatus } from "./utils";
import { HYBRID_VOTE_WEIGHTS, OFFCHAIN_THRESHOLDS } from "@/lib/constants";

// Citizen types for aggregating offchain votes
const CITIZEN_TYPES = ["USER", "APP", "CHAIN"] as const;

/**
 * Aggregate votes across citizen types
 */
function aggregateVotes(
  outcome: Record<string, Record<string, number>>,
  key: string
): number {
  let total = 0;
  for (const type of CITIZEN_TYPES) {
    total += Number(outcome?.[type]?.[key] ?? 0);
  }
  return total;
}

type OptimisticTieredMetrics = {
  againstCount: number;
  supportCount: number;
  againstPercentage: number;
  tiers: number[];
  currentTier: number;
  isDefeated: boolean;
};

/**
 * Extract optimistic-tiered voting metrics from proposal
 */
function extractOptimisticTieredMetrics(
  proposal: ArchiveListProposal,
  decimals: number
): OptimisticTieredMetrics {
  const votingData = getVotingData(proposal);
  const vd = votingData as ArchiveListProposal;
  const status = deriveStatus(proposal, decimals);

  const outcome = (vd.outcome || {}) as Record<string, Record<string, number>>;
  const againstCount = aggregateVotes(outcome, "0");
  const supportCount = aggregateVotes(outcome, "2");
  const tiers = Array.isArray(vd.tiers) ? vd.tiers : [];

  let weightedAgainstPercentage = 0;

  // Calculate offchain citizen percentages with weights
  const userAgainst = Number(outcome?.["USER"]?.["0"] ?? 0);
  const appAgainst = Number(outcome?.["APP"]?.["0"] ?? 0);
  const chainAgainst = Number(outcome?.["CHAIN"]?.["0"] ?? 0);

  if (proposal.hybrid && proposal.quorum) {
    // For hybrid proposals, also account for onchain delegates
    const onchainAgainst = Number(proposal.totals?.["no-param"]?.["0"] ?? 0);
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
    // For offchain-only, sum percentages and divide by 3
    weightedAgainstPercentage =
      ((userAgainst / OFFCHAIN_THRESHOLDS.USER) * 100 +
        (appAgainst / OFFCHAIN_THRESHOLDS.APP) * 100 +
        (chainAgainst / OFFCHAIN_THRESHOLDS.CHAIN) * 100) /
      3;
  }

  const currentTier = tiers.length > 0 ? tiers[tiers.length - 1] : 1700;

  return {
    againstCount,
    supportCount,
    againstPercentage: Math.round(weightedAgainstPercentage * 10) / 10,
    tiers,
    currentTier,
    isDefeated: status === "DEFEATED",
  };
}

/**
 * Row component for HYBRID_OPTIMISTIC_TIERED, OFFCHAIN_OPTIMISTIC_TIERED proposals
 */
export function OptimisticTieredProposalRow({
  proposal,
  tokenDecimals,
}: ArchiveRowProps) {
  const { token } = Tenant.current();
  const decimals = tokenDecimals ?? token.decimals ?? 18;

  // Compute display data and metrics
  const { displayData, metrics } = useMemo(() => {
    const displayData = extractDisplayData(
      proposal,
      "OFFCHAIN_OPTIMISTIC_TIERED",
      decimals
    );
    const metrics = extractOptimisticTieredMetrics(proposal, decimals);
    return { displayData, metrics };
  }, [proposal, decimals]);

  const statusText = metrics.isDefeated ? "defeated" : "approved";
  const highestTierPct =
    metrics.tiers.length > 0
      ? metrics.tiers[metrics.tiers.length - 1] / 100
      : 17;

  const infoText = `${metrics.againstPercentage}% / ${highestTierPct}% against needed to defeat`;

  return (
    <BaseRowLayout
      data={displayData}
      metricsContent={
        <OPOptimisticTieredArchiveStatusView
          infoText={infoText}
          statusText={statusText}
        />
      }
    />
  );
}
