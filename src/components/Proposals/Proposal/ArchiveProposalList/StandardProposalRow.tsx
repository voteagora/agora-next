"use client";

import { useMemo } from "react";
import Tenant from "@/lib/tenant/tenant";
import { OPStandardStatusView } from "../OPStandardProposalStatus";
import { HybridStandardStatusView } from "../HybridStandardProposalStatus";
import { BaseRowLayout } from "./BaseRowLayout";
import { ArchiveRowProps } from "./types";
import { extractDisplayData, isHybridProposal } from "./utils";
import {
  extractStandardMetrics,
  type StandardMetrics,
} from "@/lib/proposals/extractors";
import { FixedProposalType } from "@/lib/types/archiveProposal";

/**
 * Row component for STANDARD, HYBRID_STANDARD, OFFCHAIN_STANDARD proposals
 */
export function StandardProposalRow({
  proposal,
  tokenDecimals,
  proposalType = "STANDARD",
}: ArchiveRowProps) {
  const { token } = Tenant.current();
  const decimals = tokenDecimals ?? token.decimals ?? 18;
  const isHybrid =
    proposalType === "HYBRID_STANDARD" || isHybridProposal(proposal);

  // Compute display data and metrics
  const { displayData, metrics, proposalTypeName } = useMemo(() => {
    const effectiveType = isHybrid ? "HYBRID_STANDARD" : proposalType;
    const displayData = extractDisplayData(proposal, effectiveType, decimals);
    const metrics = extractStandardMetrics(proposal, {
      tokenDecimals: decimals,
    });
    return { displayData, metrics, proposalTypeName:
      (proposal.proposal_type as FixedProposalType)?.name ?? proposalType,
    };
  }, [proposal, decimals, proposalType, isHybrid]);

  // Use different status views for hybrid vs standard proposals
  const metricsContent = isHybrid ? (
    <HybridStandardStatusView
      forPercentage={Math.round(metrics.segments.forPercentage * 100) / 100}
      againstPercentage={
        Math.round(metrics.segments.againstPercentage * 100) / 100
      }
      abstainPercentage={
        Math.round(metrics.segments.abstainPercentage * 100) / 100
      }
    />
  ) : (
    <OPStandardStatusView
      forAmount={metrics.forRaw}
      againstAmount={metrics.againstRaw}
      abstainAmount={metrics.abstainRaw}
      decimals={decimals}
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
