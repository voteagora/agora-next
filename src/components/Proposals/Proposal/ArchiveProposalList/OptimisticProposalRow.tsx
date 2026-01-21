"use client";

import { useMemo } from "react";
import Tenant from "@/lib/tenant/tenant";
import { OPOptimisticArchiveStatusView } from "./OPOptimisticArchiveStatusView";
import { BaseRowLayout } from "./BaseRowLayout";
import { ArchiveRowProps } from "./types";
import { extractDisplayData } from "./utils";
import { extractOptimisticMetrics } from "@/lib/proposals/extractors";
import { deriveProposalType } from "@/lib/types/archiveProposal";

/**
 * Row component for OPTIMISTIC, HYBRID_OPTIMISTIC, OFFCHAIN_OPTIMISTIC proposals
 */
export function OptimisticProposalRow({
  proposal,
  tokenDecimals,
}: ArchiveRowProps) {
  const { token } = Tenant.current();
  const decimals = tokenDecimals ?? token.decimals ?? 18;
  const proposalType = deriveProposalType(proposal);
  // Compute display data and metrics
  const { displayData, metrics } = useMemo(() => {
    const displayData = extractDisplayData(proposal, proposalType, decimals);
    const metrics = extractOptimisticMetrics(proposal, {
      tokenDecimals: decimals,
    });

    return {
      displayData,
      metrics,
    };
  }, [proposal, decimals, proposalType]);

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
      proposalTypeName={proposalType}
    />
  );
}
