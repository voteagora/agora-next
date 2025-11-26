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
