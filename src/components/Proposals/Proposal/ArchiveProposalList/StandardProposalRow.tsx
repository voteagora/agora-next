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
import { extractDisplayData, convertToNumber, ensurePercentage } from "./utils";
import {
  HYBRID_VOTE_WEIGHTS,
  OFFCHAIN_THRESHOLDS,
  CITIZEN_TYPES,
} from "@/lib/constants";

// Vote keys: "1" = for, "0" = against, "2" = abstain
type VoteData = {
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
};
type RawVoteData = { forRaw: string; againstRaw: string; abstainRaw: string };

type StandardMetrics = RawVoteData & {
  segments: {
    forPercentage: number;
    againstPercentage: number;
    abstainPercentage: number;
  };
  hasVotes: boolean;
};

/** Extract vote values from a totals object (keys: "0", "1", "2") */
function extractFromTotals(
  totals: Record<string, string | number> | undefined,
  decimals: number
): VoteData & RawVoteData {
  const forRaw = String(totals?.["1"] ?? "0");
  const againstRaw = String(totals?.["0"] ?? "0");
  const abstainRaw = String(totals?.["2"] ?? "0");

  return {
    forRaw,
    againstRaw,
    abstainRaw,
    forVotes: convertToNumber(forRaw, decimals),
    againstVotes: convertToNumber(againstRaw, decimals),
    abstainVotes: convertToNumber(abstainRaw, decimals),
  };
}

/** Aggregate offchain votes across citizen types (USER, APP, CHAIN) */
function aggregateOffchainVotes(
  outcome: Record<string, Record<string, number>> | undefined
): VoteData & RawVoteData {
  let forVotes = 0,
    againstVotes = 0,
    abstainVotes = 0;
  for (const t of CITIZEN_TYPES) {
    forVotes += Number(outcome?.[t]?.["1"] ?? 0);
    againstVotes += Number(outcome?.[t]?.["0"] ?? 0);
    abstainVotes += Number(outcome?.[t]?.["2"] ?? 0);
  }
  return {
    forVotes,
    againstVotes,
    abstainVotes,
    forRaw: String(forVotes),
    againstRaw: String(againstVotes),
    abstainRaw: String(abstainVotes),
  };
}

/** Calculate weighted hybrid percentage for a single vote type */
function calcWeightedPct(
  onchainVotes: number,
  eligibleDelegates: number,
  offchain: { user: number; app: number; chain: number }
): number {
  const delegatePct = (onchainVotes / eligibleDelegates) * 100;
  const userPct = (offchain.user / OFFCHAIN_THRESHOLDS.USER) * 100;
  const appPct = (offchain.app / OFFCHAIN_THRESHOLDS.APP) * 100;
  const chainPct = (offchain.chain / OFFCHAIN_THRESHOLDS.CHAIN) * 100;
  return (
    delegatePct * HYBRID_VOTE_WEIGHTS.delegates +
    userPct * HYBRID_VOTE_WEIGHTS.users +
    appPct * HYBRID_VOTE_WEIGHTS.apps +
    chainPct * HYBRID_VOTE_WEIGHTS.chains
  );
}

/** Extract hybrid (onchain + offchain weighted) metrics */
function extractHybridMetrics(
  proposal: ArchiveListProposal,
  decimals: number
): VoteData & RawVoteData {
  const voteTotals = (proposal.totals as DaoNodeVoteTotals)?.["no-param"] || {};
  const {
    forRaw,
    againstRaw,
    abstainRaw,
    forVotes: onFor,
    againstVotes: onAgainst,
    abstainVotes: onAbstain,
  } = extractFromTotals(voteTotals, decimals);

  const offchainOutcome = proposal.govless_proposal?.outcome || {};
  const rawEligible = Number(proposal.total_voting_power_at_start);
  const eligibleDelegates = rawEligible > 0 ? rawEligible : 1;

  return {
    forRaw,
    againstRaw,
    abstainRaw,
    forVotes: calcWeightedPct(onFor, eligibleDelegates, {
      user: Number(offchainOutcome?.USER?.["1"] ?? 0),
      app: Number(offchainOutcome?.APP?.["1"] ?? 0),
      chain: Number(offchainOutcome?.CHAIN?.["1"] ?? 0),
    }),
    againstVotes: calcWeightedPct(onAgainst, eligibleDelegates, {
      user: Number(offchainOutcome?.USER?.["0"] ?? 0),
      app: Number(offchainOutcome?.APP?.["0"] ?? 0),
      chain: Number(offchainOutcome?.CHAIN?.["0"] ?? 0),
    }),
    abstainVotes: calcWeightedPct(onAbstain, eligibleDelegates, {
      user: Number(offchainOutcome?.USER?.["2"] ?? 0),
      app: Number(offchainOutcome?.APP?.["2"] ?? 0),
      chain: Number(offchainOutcome?.CHAIN?.["2"] ?? 0),
    }),
  };
}

/** Compute percentage segments from vote counts */
function computeSegments(
  votes: VoteData,
  useDirectPercentages: boolean
): StandardMetrics["segments"] {
  const { forVotes, againstVotes, abstainVotes } = votes;
  const total = forVotes + againstVotes + abstainVotes;

  if (useDirectPercentages) {
    // Hybrid: values are already weighted percentages
    return {
      forPercentage: ensurePercentage(forVotes),
      againstPercentage: ensurePercentage(againstVotes),
      abstainPercentage: ensurePercentage(abstainVotes),
    };
  }
  if (total === 0) {
    return { forPercentage: 0, againstPercentage: 0, abstainPercentage: 0 };
  }
  return {
    forPercentage: ensurePercentage((forVotes / total) * 100),
    againstPercentage: ensurePercentage((againstVotes / total) * 100),
    abstainPercentage: ensurePercentage((abstainVotes / total) * 100),
  };
}

/**
 * Extract standard voting metrics from proposal.
 * Handles: eas-oodao, eas-atlas (offchain), dao_node (onchain), and hybrid proposals.
 */
function extractStandardMetrics(
  proposal: ArchiveListProposal,
  decimals: number,
  isHybrid: boolean
): StandardMetrics {
  const source = proposal.data_eng_properties?.source;
  const isHybridProposal = isHybrid && !!proposal.govless_proposal;

  let data: VoteData & RawVoteData;

  if (source === "eas-oodao") {
    // EAS OODAO: token-holders outcome
    const th = (proposal.outcome as EasOodaoVoteOutcome)?.["token-holders"];
    data = {
      forRaw: String(th?.["1"] ?? "0"),
      againstRaw: String(th?.["0"] ?? "0"),
      abstainRaw: String(th?.["2"] ?? "0"),
      forVotes: Number(th?.["1"] ?? 0),
      againstVotes: Number(th?.["0"] ?? 0),
      abstainVotes: Number(th?.["2"] ?? 0),
    };
  } else if (isHybridProposal) {
    // Hybrid: weighted onchain + offchain
    data = extractHybridMetrics(proposal, decimals);
  } else if (source === "eas-atlas") {
    // Offchain only: aggregate citizen votes
    data = aggregateOffchainVotes(
      proposal.outcome as Record<string, Record<string, number>>
    );
  } else {
    // Onchain only (dao_node)
    const voteTotals = (proposal.totals as DaoNodeVoteTotals)?.["no-param"];
    data = extractFromTotals(voteTotals, decimals);
  }

  const total = data.forVotes + data.againstVotes + data.abstainVotes;

  return {
    forRaw: data.forRaw,
    againstRaw: data.againstRaw,
    abstainRaw: data.abstainRaw,
    segments: computeSegments(data, isHybridProposal),
    hasVotes: total > 0 || isHybridProposal,
  };
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
  console.log("metrics.segments:", metrics, proposal, displayData);
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
