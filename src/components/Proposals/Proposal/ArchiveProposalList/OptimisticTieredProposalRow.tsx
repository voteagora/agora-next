"use client";

import { useMemo } from "react";
import Tenant from "@/lib/tenant/tenant";
import { OPOptimisticTieredArchiveStatusView } from "./OPOptimisticTieredArchiveStatusView";
import { BaseRowLayout } from "./BaseRowLayout";
import { ArchiveRowProps } from "./types";
import { extractDisplayData } from "./utils";
import { extractOptimisticTieredMetrics } from "@/lib/proposals/extractors";
import { deriveProposalType } from "@/lib/types/archiveProposal";

/**
 * Row component for HYBRID_OPTIMISTIC_TIERED, OFFCHAIN_OPTIMISTIC_TIERED proposals
 */
export function OptimisticTieredProposalRow({
  proposal,
  tokenDecimals,
}: ArchiveRowProps) {
  const { token } = Tenant.current();
  const decimals = tokenDecimals ?? token.decimals ?? 18;
  const proposalType = deriveProposalType(proposal);

  // Compute display data and metrics
  const { displayData, metrics } = useMemo(() => {
    const displayData = extractDisplayData(proposal, proposalType, decimals);
    const metrics = extractOptimisticTieredMetrics(proposal, {
      tokenDecimals: decimals,
    });
    return { displayData, metrics };
  }, [proposal, decimals, proposalType]);

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
