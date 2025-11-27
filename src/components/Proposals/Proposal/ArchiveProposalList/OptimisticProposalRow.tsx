"use client";

import { useMemo } from "react";
import Tenant from "@/lib/tenant/tenant";
import { OPOptimisticArchiveStatusView } from "./OPOptimisticArchiveStatusView";
import { BaseRowLayout } from "./BaseRowLayout";
import { ArchiveRowProps } from "./types";
import { extractDisplayData } from "./utils";
import { extractOptimisticMetrics } from "@/lib/proposals/extractors";

/**
 * Row component for OPTIMISTIC, HYBRID_OPTIMISTIC, OFFCHAIN_OPTIMISTIC proposals
 */
export function OptimisticProposalRow({
  proposal,
  tokenDecimals,
}: ArchiveRowProps) {
  const { token } = Tenant.current();
  const decimals = tokenDecimals ?? token.decimals ?? 18;

  // Compute display data and metrics
  const { displayData, metrics } = useMemo(() => {
    const displayData = extractDisplayData(proposal, "OPTIMISTIC", decimals);
    const metrics = extractOptimisticMetrics(proposal, {
      tokenDecimals: decimals,
    });

    return { displayData, metrics };
  }, [proposal, decimals]);

  const status = metrics.isDefeated ? "defeated" : "approved";

  return (
    <BaseRowLayout
      data={displayData}
      metricsContent={
        <OPOptimisticArchiveStatusView
          againstRelativeAmount={metrics.againstPercentage}
          disapprovalThreshold={metrics.defeatThreshold}
          status={status}
        />
      }
    />
  );
}
