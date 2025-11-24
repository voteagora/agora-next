"use client";

import { useMemo } from "react";
import { ArchiveListProposal } from "@/lib/types/archiveProposal";
import Tenant from "@/lib/tenant/tenant";
import { OPOptimisticArchiveStatusView } from "./OPOptimisticArchiveStatusView";
import { BaseRowLayout } from "./BaseRowLayout";
import { ArchiveRowProps } from "./types";
import {
  extractDisplayData,
  getVotingData,
  convertToNumber,
  deriveStatus,
} from "./utils";
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

type OptimisticMetrics = {
  againstCount: number;
  againstPercentage: number;
  defeatThreshold: number;
  isDefeated: boolean;
};

/**
 * Extract optimistic voting metrics from proposal
 * Handles both pure onchain (OPTIMISTIC) and hybrid/offchain variants
 */
function extractOptimisticMetrics(
  proposal: ArchiveListProposal,
  decimals: number,
  isHybridOrOffchain: boolean
): OptimisticMetrics {
  const votingData = getVotingData(proposal);
  const vd = votingData as ArchiveListProposal;
  const status = deriveStatus(proposal, decimals);
  const defeatThreshold = 17; // Standard 17% threshold

  if (isHybridOrOffchain) {
    // HYBRID/OFFCHAIN OPTIMISTIC: Uses weighted citizen percentages
    const outcome = (vd.outcome || {}) as Record<
      string,
      Record<string, number>
    >;
    const againstCount = aggregateVotes(outcome, "0");

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

    return {
      againstCount,
      againstPercentage: Math.round(weightedAgainstPercentage * 10) / 10,
      defeatThreshold,
      isDefeated: status === "DEFEATED",
    };
  } else {
    // Pure OPTIMISTIC: Only delegate votes matter
    const voteTotals = vd.totals?.["no-param"] || {};
    const againstVal = voteTotals["0"];
    const againstVotesRaw =
      typeof againstVal === "string" ? againstVal : String(againstVal ?? "0");
    const againstCount = convertToNumber(againstVotesRaw, decimals);

    // Calculate percentage based on quorum
    let againstPercentage = 0;
    if (proposal.quorum) {
      const quorumValue = convertToNumber(String(proposal.quorum), decimals);
      againstPercentage =
        quorumValue > 0
          ? Math.round((againstCount / quorumValue) * 100 * 10) / 10
          : 0;
    }

    return {
      againstCount,
      againstPercentage,
      defeatThreshold,
      isDefeated: status === "DEFEATED",
    };
  }
}

type OptimisticProposalRowProps = ArchiveRowProps & {
  /** Whether this is a hybrid or offchain variant */
  isHybridOrOffchain?: boolean;
};

/**
 * Row component for OPTIMISTIC, HYBRID_OPTIMISTIC, OFFCHAIN_OPTIMISTIC proposals
 */
export function OptimisticProposalRow({
  proposal,
  tokenDecimals,
  isHybridOrOffchain = false,
}: OptimisticProposalRowProps) {
  const { token } = Tenant.current();
  const decimals = tokenDecimals ?? token.decimals ?? 18;

  // Compute display data and metrics
  const { displayData, metrics } = useMemo(() => {
    const displayData = extractDisplayData(proposal, "OPTIMISTIC", decimals);
    const metrics = extractOptimisticMetrics(
      proposal,
      decimals,
      isHybridOrOffchain
    );
    return { displayData, metrics };
  }, [proposal, decimals, isHybridOrOffchain]);

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
