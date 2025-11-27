"use client";

import { useMemo } from "react";
import Tenant from "@/lib/tenant/tenant";
import { OPApprovalArchiveStatusView } from "./OPApprovalArchiveStatusView";
import { BaseRowLayout } from "./BaseRowLayout";
import { ArchiveRowProps } from "./types";
import { extractDisplayData } from "./utils";
import { extractApprovalMetrics } from "@/lib/proposals/extractors";

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
    const metrics = extractApprovalMetrics(proposal, {
      tokenDecimals: decimals,
    });
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
