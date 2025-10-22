import { formatUnits } from "ethers";

import { capitalizeFirstLetter, getProposalTypeText } from "@/lib/utils";

export type ArchiveProposalMetrics = {
  kind: "standard";
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

export type ArchiveProposalDisplay = {
  id: string;
  href: string;
  title: string;
  typeLabel: string;
  proposerAddress: string;
  proposerEns?: string;
  statusLabel: string;
  timeStatus: {
    proposalStatus: string;
    proposalStartTime: Date | null;
    proposalEndTime: Date | null;
    proposalCancelledTime: Date | null;
    proposalExecutedTime: Date | null;
  };
  metrics: ArchiveProposalMetrics;
};

type NormalizeOptions = {
  namespace?: string | null;
  tokenDecimals?: number;
};

const STATUS_LABEL_MAP: Record<string, string> = {
  ACTIVE: "Active",
  SUCCEEDED: "Succeeded",
  EXECUTED: "Executed",
  DEFEATED: "Defeated",
  QUEUED: "Queued",
  CANCELLED: "Cancelled",
  PASSED: "Passed",
  UNKNOWN: "Unknown",
};

const convertToNumber = (
  amount: string | null | undefined,
  decimals: number
) => {
  if (!amount) return 0;
  try {
    return Number(formatUnits(amount, decimals));
  } catch {
    return 0;
  }
};

const ensurePercentage = (value: number) => {
  if (!Number.isFinite(value) || value < 0) return 0;
  if (value > 100) return 100;
  return value;
};

const toDate = (value: number | string | undefined | null) => {
  if (value === null || value === undefined) return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return new Date(numeric * 1000);
};

const deriveTimeStatus = (
  proposal: Record<string, any>,
  normalizedStatus: string
) => {
  const proposalStartTime = toDate(proposal.start_blocktime);
  const proposalEndTime = toDate(proposal.end_blocktime);
  const proposalCancelledTime =
    toDate(proposal.cancel_event?.blocktime) ||
    toDate(proposal.cancelled_event?.blocktime);
  const proposalExecutedTime =
    toDate(proposal.execute_event?.blocktime) ||
    toDate(proposal.executed_event?.blocktime);

  return {
    proposalStatus: normalizedStatus,
    proposalStartTime,
    proposalEndTime,
    proposalCancelledTime,
    proposalExecutedTime,
  } as const;
};

const TEN_DAYS_IN_SECONDS = 10 * 24 * 60 * 60;

// Quorum threshold: proposal needs at least this percentage of votes to pass
const QUORUM_THRESHOLD_PERCENT = 4; // 4% quorum requirement

const deriveStatus = (
  proposal: Record<string, any>,
  decimals: number
): string => {
  // Check terminal states first
  if (proposal.cancel_event) {
    return "CANCELLED";
  } else if (proposal.execute_event) {
    return "EXECUTED";
  } else if (proposal.queue_event) {
    const queueTimestamp = Number(
      proposal.queue_event.timestamp ?? proposal.queue_event.blocktime ?? 0
    );
    //TODO: we should check for no onchain actions
    if (
      queueTimestamp > 0 &&
      Math.floor(Date.now() / 1000) - queueTimestamp > TEN_DAYS_IN_SECONDS
    ) {
      return "PASSED";
    }
    return "QUEUED";
  }

  // Check if proposal is still active
  const now = Math.floor(Date.now() / 1000);
  const endTime = Number(proposal.end_blocktime) || 0;
  if (endTime > now) {
    return "ACTIVE";
  }

  // Voting has ended, determine outcome for standard proposals
  // Handle different data sources: EAS-OODAO vs standard
  const source = proposal.data_eng_properties?.source;
  const voteTotals =
    source === "eas-oodao"
      ? proposal.outcome?.["token-holders"] || {}
      : proposal.totals?.["no-param"] || {};

  const forVotes = convertToNumber(voteTotals["1"], decimals);
  const againstVotes = convertToNumber(voteTotals["0"], decimals);

  // Calculate quorum (for + abstain) and vote thresholds
  const totalVotes = forVotes + againstVotes;
  const forPercentage = totalVotes > 0 ? (forVotes / totalVotes) * 100 : 0;

  // Proposal is defeated if:
  // 1. For votes don't meet approval threshold, we dont have the values yet.
  // 2. For votes <= Against votes
  if (forPercentage < QUORUM_THRESHOLD_PERCENT || forVotes <= againstVotes) {
    return "DEFEATED";
  }

  return "SUCCEEDED";
};

const deriveType = (): string => {
  // Only support STANDARD proposals for now
  return "STANDARD";
};

export function normalizeArchiveProposal(
  proposal: Record<string, any>,
  options: NormalizeOptions = {}
): ArchiveProposalDisplay {
  const decimals = options.tokenDecimals ?? 18;
  const type = deriveType();
  const status = deriveStatus(proposal, decimals);
  const normalizedStatus = STATUS_LABEL_MAP[status] ? status : "UNKNOWN";
  const fallbackLabel = capitalizeFirstLetter(
    type.toLowerCase().replace(/_/g, " ")
  );
  const typeLabel =
    getProposalTypeText(
      type,
      type === "SNAPSHOT" ? (proposal as any).proposalData : undefined
    ) || fallbackLabel;

  // Handle different data sources: EAS-OODAO vs standard
  const source = proposal.data_eng_properties?.source;
  const voteTotals =
    source === "eas-oodao"
      ? proposal.outcome?.["token-holders"] || {}
      : proposal.totals?.["no-param"] || {};

  const forVotesRaw = voteTotals["1"] ?? "0";
  const againstVotesRaw = voteTotals["0"] ?? "0";
  const abstainVotesRaw = voteTotals["2"] ?? "0";

  const forVotes = convertToNumber(forVotesRaw, decimals);
  const againstVotes = convertToNumber(againstVotesRaw, decimals);
  const abstainVotes = convertToNumber(abstainVotesRaw, decimals);
  const totalVotes = forVotes + againstVotes + abstainVotes;

  const voteMetrics: ArchiveProposalMetrics = {
    kind: "standard",
    forRaw: forVotesRaw,
    againstRaw: againstVotesRaw,
    abstainRaw: abstainVotesRaw,
    segments:
      totalVotes > 0
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
          },
    hasVotes: totalVotes > 0,
  };

  const metrics: ArchiveProposalMetrics = voteMetrics;

  const title = proposal.title || "Untitled Proposal";

  return {
    id: proposal.id,
    href: `/proposals/${proposal.id}`,
    title,
    typeLabel,
    proposerAddress: proposal.proposer,
    proposerEns:
      typeof proposal.proposer_ens === "string"
        ? proposal.proposer_ens
        : proposal.proposer_ens?.detail,
    statusLabel: STATUS_LABEL_MAP[normalizedStatus],
    timeStatus: deriveTimeStatus(proposal, normalizedStatus),
    metrics,
  };
}

export function normalizeArchiveProposals(
  proposals: Record<string, any>[],
  options: NormalizeOptions = {}
) {
  return proposals.map((proposal) =>
    normalizeArchiveProposal(proposal, options)
  );
}
