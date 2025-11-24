"use client";

import { useMemo } from "react";
import {
  ArchiveListProposal,
  EasOodaoVoteOutcome,
  DaoNodeVoteTotals,
} from "@/lib/types/archiveProposal";
import Tenant from "@/lib/tenant/tenant";
import { OPStandardStatusView } from "../OPStandardProposalStatus";
import { HybridStandardStatusView } from "../HybridStandardProposalStatus";
import { BaseRowLayout } from "./BaseRowLayout";
import { ArchiveRowProps } from "./types";
import {
  extractDisplayData,
  getVotingData,
  convertToNumber,
  ensurePercentage,
} from "./utils";
import { HYBRID_VOTE_WEIGHTS, OFFCHAIN_THRESHOLDS } from "@/lib/constants";

// Citizen types for aggregating offchain votes
const CITIZEN_TYPES = ["USER", "APP", "CHAIN"] as const;

/**
 * Aggregate votes across citizen types for offchain proposals
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

type StandardMetrics = {
  forRaw: string;
  againstRaw: string;
  abstainRaw: string;
  segments: {
    forPercentage: number;
    againstPercentage: number;
    abstainPercentage: number;
  };
  hasVotes: boolean;
};

/**
 * Extract standard voting metrics from proposal
 * For hybrid proposals, uses weighted calculation across onchain delegates and offchain citizens
 */
function extractStandardMetrics(
  proposal: ArchiveListProposal,
  decimals: number,
  isHybrid: boolean
): StandardMetrics {
  const source = proposal.data_eng_properties?.source;

  let forVotes = 0;
  let againstVotes = 0;
  let abstainVotes = 0;
  let forVotesRaw = "0";
  let againstVotesRaw = "0";
  let abstainVotesRaw = "0";

  if (source === "eas-oodao") {
    const tokenHolderOutcome = (proposal.outcome as EasOodaoVoteOutcome)?.[
      "token-holders"
    ];

    if (!tokenHolderOutcome) {
      forVotes = 0;
      againstVotes = 0;
      abstainVotes = 0;
      forVotesRaw = "0";
      againstVotesRaw = "0";
      abstainVotesRaw = "0";
    } else {
      const forRawValue = tokenHolderOutcome["1"] ?? "0";
      const againstRawValue = tokenHolderOutcome["0"] ?? "0";
      const abstainRawValue = tokenHolderOutcome["2"] ?? "0";

      forVotes = Number(forRawValue ?? 0);
      againstVotes = Number(againstRawValue ?? 0);
      abstainVotes = Number(abstainRawValue ?? 0);

      forVotesRaw = String(forRawValue);
      againstVotesRaw = String(againstRawValue);
      abstainVotesRaw = String(abstainRawValue);
    }
  } else {
    // ONCHAIN ONLY (dao_node): Use totals
    const voteTotals =
      (proposal.totals as DaoNodeVoteTotals)?.["no-param"] || {};
    if (isHybrid && proposal.govless_proposal) {
      // HYBRID: Use weighted calculation across all houses
      // 1. Get onchain delegate votes from proposal.totals
      const onchainTotals = proposal.totals?.["no-param"] || {};
      const onchainForRaw = String(onchainTotals["1"] ?? "0");
      const onchainAgainstRaw = String(onchainTotals["0"] ?? "0");
      const onchainAbstainRaw = String(onchainTotals["2"] ?? "0");

      const onchainFor = convertToNumber(onchainForRaw, decimals);
      const onchainAgainst = convertToNumber(onchainAgainstRaw, decimals);
      const onchainAbstain = convertToNumber(onchainAbstainRaw, decimals);

      // Store raw values for non-percentage display
      forVotesRaw = onchainForRaw;
      againstVotesRaw = onchainAgainstRaw;
      abstainVotesRaw = onchainAbstainRaw;

      // 2. Get offchain votes from govless_proposal.outcome
      const offchainOutcome = (proposal.govless_proposal.outcome ||
        {}) as Record<string, Record<string, number>>;
      const userFor = Number(offchainOutcome?.USER?.["1"] ?? 0);
      const userAgainst = Number(offchainOutcome?.USER?.["0"] ?? 0);
      const userAbstain = Number(offchainOutcome?.USER?.["2"] ?? 0);
      const appFor = Number(offchainOutcome?.APP?.["1"] ?? 0);
      const appAgainst = Number(offchainOutcome?.APP?.["0"] ?? 0);
      const appAbstain = Number(offchainOutcome?.APP?.["2"] ?? 0);
      const chainFor = Number(offchainOutcome?.CHAIN?.["1"] ?? 0);
      const chainAgainst = Number(offchainOutcome?.CHAIN?.["0"] ?? 0);
      const chainAbstain = Number(offchainOutcome?.CHAIN?.["2"] ?? 0);

      // 3. Calculate weighted percentages
      // Delegate percentage is based on eligible delegates (quorum * 100/30)
      const eligibleDelegates =
        Number(proposal.total_voting_power_at_start) || 1;

      // Calculate weighted FOR votes
      const delegateForPct = (onchainFor / eligibleDelegates) * 100;
      const userForPct = (userFor / OFFCHAIN_THRESHOLDS.USER) * 100;
      const appForPct = (appFor / OFFCHAIN_THRESHOLDS.APP) * 100;
      const chainForPct = (chainFor / OFFCHAIN_THRESHOLDS.CHAIN) * 100;
      forVotes =
        delegateForPct * HYBRID_VOTE_WEIGHTS.delegates +
        userForPct * HYBRID_VOTE_WEIGHTS.users +
        appForPct * HYBRID_VOTE_WEIGHTS.apps +
        chainForPct * HYBRID_VOTE_WEIGHTS.chains;

      // Calculate weighted AGAINST votes
      const delegateAgainstPct = (onchainAgainst / eligibleDelegates) * 100;
      const userAgainstPct = (userAgainst / OFFCHAIN_THRESHOLDS.USER) * 100;
      const appAgainstPct = (appAgainst / OFFCHAIN_THRESHOLDS.APP) * 100;
      const chainAgainstPct = (chainAgainst / OFFCHAIN_THRESHOLDS.CHAIN) * 100;
      againstVotes =
        delegateAgainstPct * HYBRID_VOTE_WEIGHTS.delegates +
        userAgainstPct * HYBRID_VOTE_WEIGHTS.users +
        appAgainstPct * HYBRID_VOTE_WEIGHTS.apps +
        chainAgainstPct * HYBRID_VOTE_WEIGHTS.chains;

      // Calculate weighted ABSTAIN votes
      const delegateAbstainPct = (onchainAbstain / eligibleDelegates) * 100;
      const userAbstainPct = (userAbstain / OFFCHAIN_THRESHOLDS.USER) * 100;
      const appAbstainPct = (appAbstain / OFFCHAIN_THRESHOLDS.APP) * 100;
      const chainAbstainPct = (chainAbstain / OFFCHAIN_THRESHOLDS.CHAIN) * 100;
      abstainVotes =
        delegateAbstainPct * HYBRID_VOTE_WEIGHTS.delegates +
        userAbstainPct * HYBRID_VOTE_WEIGHTS.users +
        appAbstainPct * HYBRID_VOTE_WEIGHTS.apps +
        chainAbstainPct * HYBRID_VOTE_WEIGHTS.chains;
    } else if (source === "eas-atlas" || source === "eas-oodao") {
      // OFFCHAIN ONLY: Use outcome data
      const outcome = (proposal.outcome || {}) as Record<
        string,
        Record<string, number>
      >;
      forVotes = aggregateVotes(outcome, "1");
      againstVotes = aggregateVotes(outcome, "0");
      abstainVotes = aggregateVotes(outcome, "2");

      forVotesRaw = forVotes.toString();
      againstVotesRaw = againstVotes.toString();
      abstainVotesRaw = abstainVotes.toString();
    } else {
      // ONCHAIN ONLY (dao_node): Use totals
      const voteTotals = proposal.totals?.["no-param"] || {};
      const forVal = voteTotals["1"];
      const againstVal = voteTotals["0"];
      const abstainVal = voteTotals["2"];

      forVotesRaw = typeof forVal === "string" ? forVal : String(forVal ?? "0");
      againstVotesRaw =
        typeof againstVal === "string" ? againstVal : String(againstVal ?? "0");
      abstainVotesRaw =
        typeof abstainVal === "string" ? abstainVal : String(abstainVal ?? "0");

      forVotes = convertToNumber(forVotesRaw, decimals);
      againstVotes = convertToNumber(againstVotesRaw, decimals);
      abstainVotes = convertToNumber(abstainVotesRaw, decimals);
    }

    // For hybrid proposals, forVotes/againstVotes/abstainVotes are already weighted percentages
    // For non-hybrid, they are vote counts that need to be converted to percentages
    const totalVotes = forVotes + againstVotes + abstainVotes;

    // Determine if we should use the values directly as percentages (hybrid) or calculate them
    const segments =
      isHybrid && proposal.govless_proposal
        ? {
            // For hybrid, use the weighted percentages directly
            forPercentage: ensurePercentage(forVotes),
            abstainPercentage: ensurePercentage(abstainVotes),
            againstPercentage: ensurePercentage(againstVotes),
          }
        : totalVotes > 0
          ? {
              forPercentage: ensurePercentage((forVotes / totalVotes) * 100),
              abstainPercentage: ensurePercentage(
                (abstainVotes / totalVotes) * 100
              ),
              againstPercentage: ensurePercentage(
                (againstVotes / totalVotes) * 100
              ),
            }
          : {
              forPercentage: 0,
              abstainPercentage: 0,
              againstPercentage: 0,
            };

    return {
      forRaw: forVotesRaw,
      againstRaw: againstVotesRaw,
      abstainRaw: abstainVotesRaw,
      segments,
      hasVotes: totalVotes > 0 || (isHybrid && !!proposal.govless_proposal),
    };
  }
}

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
  const isHybrid = proposalType === "HYBRID_STANDARD" || !!proposal.hybrid;

  // Compute display data and metrics
  const { displayData, metrics } = useMemo(() => {
    // Use the actual proposal type for correct display name
    const effectiveType = isHybrid ? "HYBRID_STANDARD" : proposalType;
    const displayData = extractDisplayData(proposal, effectiveType, decimals);
    const metrics = extractStandardMetrics(proposal, decimals, isHybrid);
    return { displayData, metrics };
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

  return <BaseRowLayout data={displayData} metricsContent={metricsContent} />;
}
