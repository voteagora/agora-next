import { formatUnits } from "ethers";

import { PROPOSAL_DEFAULTS } from "@/app/proposals/data/constants";
import { capitalizeFirstLetter, getProposalTypeText } from "@/lib/utils";

export type ArchiveProposalMetrics =
  | {
      kind: "vote";
      forRaw: string;
      againstRaw: string;
      abstainRaw: string;
      segments: {
        forPercentage: number;
        againstPercentage: number;
        abstainPercentage: number;
      };
      hasVotes: boolean;
    }
  | {
      kind: "optimistic";
      summary: string;
      statusLine: string;
    }
  | {
      kind: "hybridOptimistic";
      infoText: string;
      statusText: string;
    }
  | {
      kind: "approval";
      maxApprovals: number | null;
      optionCount: number | null;
    }
  | {
      kind: "hybridStandard";
      forPercentage: number;
      againstPercentage: number;
      abstainPercentage: number;
    }
  | {
      kind: "none";
      message?: string;
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
  fallbackVotableSupply?: string | null;
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

const roundPercentage = (value: number) =>
  Number.isFinite(value) ? Math.round(value * 100) / 100 : 0;

const calculatePercentageShare = (value: number, total: number) =>
  total > 0 ? roundPercentage((value / total) * 100) : 0;

const toDate = (value: number | string | undefined | null) => {
  if (value === null || value === undefined) return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return new Date(numeric * 1000);
};

const getTimestampFromKeys = (
  source: Record<string, any> | null | undefined,
  keys: string[]
) => {
  if (!source) return null;
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      const date = toDate(source[key]);
      if (date) {
        return date;
      }
    }
  }
  return null;
};

const deriveTimeStatus = (
  proposal: Record<string, any>,
  normalizedStatus: string
) => {
  const proposalStartTime = getTimestampFromKeys(proposal, [
    "start_blocktime",
    "start_timestamp",
    "start_ts",
    "startts",
    "start_time",
    "startTime",
  ]);

  const proposalEndTime = getTimestampFromKeys(proposal, [
    "end_blocktime",
    "end_timestamp",
    "end_ts",
    "endts",
    "end_time",
    "endTime",
  ]);

  const proposalCancelledTime =
    getTimestampFromKeys(proposal.cancel_event, ["timestamp", "blocktime"]) ||
    getTimestampFromKeys(proposal.cancelled_event, ["timestamp", "blocktime"]);

  const proposalExecutedTime =
    getTimestampFromKeys(proposal.execute_event, ["timestamp", "blocktime"]) ||
    getTimestampFromKeys(proposal.executed_event, ["timestamp", "blocktime"]);

  return {
    proposalStatus: normalizedStatus,
    proposalStartTime,
    proposalEndTime,
    proposalCancelledTime,
    proposalExecutedTime,
  } as const;
};

const deriveHybridOptimisticStatusData = (
  status: string,
  againstRelative: number | null,
  thresholdPercent: number | null
) => {
  const infoSegments: string[] = [];

  if (status === "DEFEATED") {
    if (againstRelative != null && thresholdPercent != null) {
      infoSegments.push(
        `${againstRelative}% / ${thresholdPercent}% against votes`
      );
    } else if (againstRelative != null) {
      infoSegments.push(`${againstRelative}% against votes`);
    } else {
      infoSegments.push("Optimistic proposal");
    }
  } else {
    if (againstRelative != null && thresholdPercent != null) {
      infoSegments.push(
        `${againstRelative}% / ${thresholdPercent}% against needed to defeat`
      );
    } else if (thresholdPercent != null) {
      infoSegments.push(`Against threshold ${thresholdPercent}%`);
    } else if (againstRelative != null) {
      infoSegments.push(`${againstRelative}% against votes`);
    } else {
      infoSegments.push("Optimistic proposal");
    }
  }

  const statusText = status === "DEFEATED" ? "defeated" : "approved";

  return {
    infoText: infoSegments.join(" "),
    statusText,
  };
};

const TEN_DAYS_IN_SECONDS = 10 * 24 * 60 * 60;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const isZeroAddress = (value: string | null | undefined) => {
  if (!value) return true;
  return value.trim().toLowerCase() === ZERO_ADDRESS;
};

const isEmptyHex = (value: string | null | undefined) => {
  if (!value) return true;
  const trimmed = value.trim().toLowerCase();
  if (trimmed === "" || trimmed === "0x" || trimmed === "0") return true;
  return /^0x0+$/.test(trimmed);
};

const extractOptionsFromProposal = (proposal: Record<string, any>) => {
  const options: Array<{ targets?: string[]; calldatas?: string[] }> = [];

  if (Array.isArray(proposal.targets) || Array.isArray(proposal.calldatas)) {
    options.push({
      targets: Array.isArray(proposal.targets) ? proposal.targets : [],
      calldatas: Array.isArray(proposal.calldatas) ? proposal.calldatas : [],
    });
  }

  const decoded = proposal.decoded_proposal_data ?? proposal.proposal_data;

  const pushIfStructured = (entry: unknown) => {
    if (!entry || typeof entry !== "object") return;
    const maybeTargets = (entry as Record<string, any>).targets;
    const maybeCalldatas =
      (entry as Record<string, any>).calldatas ??
      (entry as Record<string, any>).calldata ??
      (entry as Record<string, any>).data;
    if (Array.isArray(maybeTargets) || Array.isArray(maybeCalldatas)) {
      options.push({
        targets: Array.isArray(maybeTargets) ? maybeTargets : [],
        calldatas: Array.isArray(maybeCalldatas) ? maybeCalldatas : [],
      });
    }
  };

  if (Array.isArray(decoded)) {
    decoded.forEach(pushIfStructured);
  } else if (decoded && typeof decoded === "object") {
    pushIfStructured(decoded);
    Object.values(decoded).forEach(pushIfStructured);
  }

  return options;
};

const hasOnchainActions = (proposal: Record<string, any>) => {
  const options = extractOptionsFromProposal(proposal);
  if (options.length === 0) {
    return false;
  }

  return options.some((option) => {
    const hasTargets = Array.isArray(option.targets)
      ? option.targets.some((target) => !isZeroAddress(target))
      : false;
    const hasCalldatas = Array.isArray(option.calldatas)
      ? option.calldatas.some((calldata) => !isEmptyHex(calldata))
      : false;

    return hasTargets || hasCalldatas;
  });
};

const hasNoCalldata = (proposal: Record<string, any>) => {
  try {
    return !hasOnchainActions(proposal);
  } catch (error) {
    console.warn("Failed to inspect proposal calldata", error);
    return false;
  }
};

const tryParseJson = (value: unknown): unknown => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn("Failed to parse archive JSON payload", error);
      return null;
    }
  }
  return value;
};

const toArray = (value: unknown): any[] | null => {
  if (Array.isArray(value)) {
    return value;
  }
  const parsed = tryParseJson(value);
  return Array.isArray(parsed) ? parsed : null;
};

const extractApprovalMetadata = (
  proposal: Record<string, any>
): { maxApprovals: number | null; optionCount: number | null } => {
  const sources = [
    proposal,
    ...(Array.isArray(proposal.linked_offchain)
      ? proposal.linked_offchain
      : []),
  ];

  for (const source of sources) {
    const raw =
      source?.decoded_proposal_data !== undefined
        ? source.decoded_proposal_data
        : source?.proposal_data;

    const root = toArray(raw);
    if (!root || root.length < 2) {
      continue;
    }

    const options = toArray(root[0]);
    const settings = toArray(root[1]);

    const optionCount = options ? options.length : null;
    const rawMax = settings && settings.length > 0 ? Number(settings[0]) : null;
    const normalizedMax =
      rawMax != null && Number.isFinite(rawMax)
        ? rawMax
        : (optionCount ?? null);

    return {
      maxApprovals: normalizedMax,
      optionCount,
    };
  }

  return { maxApprovals: null, optionCount: null };
};

const extractOnchainProposalId = (proposal: Record<string, any>) => {
  const value = proposal.onchain_proposalid;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed && trimmed !== "0" ? trimmed : null;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) && value !== 0 ? value.toString() : null;
  }
  return null;
};

const deriveStatus = (
  proposal: Record<string, any>,
  decimals: number
): string => {
  if (proposal.cancel_event) return "CANCELLED";
  if (proposal.execute_event) return "EXECUTED";
  if (proposal.queue_event) {
    const queueTimestamp = Number(
      proposal.queue_event.timestamp ?? proposal.queue_event.blocktime ?? 0
    );
    if (
      queueTimestamp > 0 &&
      Math.floor(Date.now() / 1000) - queueTimestamp > TEN_DAYS_IN_SECONDS &&
      hasNoCalldata(proposal)
    ) {
      return "PASSED";
    }
    return "QUEUED";
  }

  const now = Math.floor(Date.now() / 1000);
  const endTime = Number(proposal.end_blocktime) || 0;
  if (endTime > now) return "ACTIVE";

  const totals = proposal.totals?.["no-param"] || {};
  const forVotes = convertToNumber(totals["1"], decimals);
  const againstVotes = convertToNumber(totals["0"], decimals);

  if (forVotes > againstVotes) return "SUCCEEDED";
  if (
    forVotes === 0 &&
    againstVotes === 0 &&
    proposal.data_eng_properties?.liveness === "live"
  ) {
    return "ACTIVE";
  }

  return "DEFEATED";
};

const deriveType = (proposal: Record<string, any>): string => {
  const linked = Array.isArray(proposal.linked_offchain)
    ? proposal.linked_offchain
    : [];

  for (const linkedProposal of linked) {
    const linkedType = String(
      linkedProposal?.proposal_type_text || linkedProposal?.proposal_type || ""
    ).toUpperCase();

    if (linkedType.includes("OPTIMISTIC_TIERED")) {
      return "HYBRID_OPTIMISTIC_TIERED";
    }
    if (linkedType.includes("OPTIMISTIC")) {
      return "OPTIMISTIC";
    }
    if (linkedType.includes("APPROVAL")) {
      return "HYBRID_APPROVAL";
    }
    if (linkedType.includes("HYBRID_STANDARD")) {
      return "HYBRID_STANDARD";
    }
    if (linkedType.includes("STANDARD")) {
      return "STANDARD";
    }
  }

  const votingModule = String(proposal.voting_module_name || "").toUpperCase();
  if (
    votingModule === "STANDARD" ||
    votingModule === "APPROVAL" ||
    votingModule === "OPTIMISTIC"
  ) {
    return votingModule;
  }

  const rawType = String(
    proposal.proposal_type_text || proposal.proposal_type || ""
  ).toUpperCase();

  if (rawType.includes("OPTIMISTIC_TIERED")) {
    const hasHybridId = extractOnchainProposalId(proposal);
    return hasHybridId ? "HYBRID_OPTIMISTIC_TIERED" : "OPTIMISTIC_TIERED";
  }

  if (rawType.includes("OPTIMISTIC")) return "OPTIMISTIC";
  if (rawType.includes("APPROVAL")) {
    const hasHybridId = extractOnchainProposalId(proposal);
    return hasHybridId ? "HYBRID_APPROVAL" : "APPROVAL";
  }
  if (rawType.includes("HYBRID_STANDARD")) return "HYBRID_STANDARD";
  if (rawType.includes("STANDARD")) return "STANDARD";

  return "STANDARD";
};

const extractOptimisticThreshold = (proposal: Record<string, any>) => {
  const sources = [
    proposal,
    ...(Array.isArray(proposal.linked_offchain)
      ? proposal.linked_offchain
      : []),
  ];

  for (const src of sources) {
    const decoded = src?.decoded_proposal_data ?? src?.proposal_data;

    if (Array.isArray(decoded)) {
      const firstEntry = decoded[0];
      if (Array.isArray(firstEntry) && typeof firstEntry[0] === "number") {
        return Number(firstEntry[0]);
      }
      if (typeof firstEntry === "number") {
        return Number(firstEntry);
      }
    }

    if (decoded && typeof decoded === "object") {
      if (typeof decoded.disapprovalThreshold === "number") {
        return decoded.disapprovalThreshold;
      }
      if (typeof decoded.threshold === "number") {
        return decoded.threshold;
      }
    }

    if (
      src?.tiers &&
      Array.isArray(src.tiers) &&
      typeof src.tiers[0] === "number"
    ) {
      return Number(src.tiers[0]);
    }
  }

  return null;
};

export function normalizeArchiveProposal(
  proposal: Record<string, any>,
  options: NormalizeOptions = {}
): ArchiveProposalDisplay {
  const decimals = options.tokenDecimals ?? 18;
  const status = deriveStatus(proposal, decimals);
  const normalizedStatus = STATUS_LABEL_MAP[status] ? status : "UNKNOWN";
  const type = deriveType(proposal);
  const fallbackLabel = capitalizeFirstLetter(
    type.toLowerCase().replace(/_/g, " ")
  );
  const typeLabel =
    getProposalTypeText(
      type,
      type === "SNAPSHOT" ? (proposal as any).proposalData : undefined
    ) || fallbackLabel;

  const totals = proposal.totals?.["no-param"] || {};
  const forVotesRaw = totals["1"] ?? "0";
  const againstVotesRaw = totals["0"] ?? "0";
  const abstainVotesRaw = totals["2"] ?? "0";

  const forVotes = convertToNumber(forVotesRaw, decimals);
  const againstVotes = convertToNumber(againstVotesRaw, decimals);
  const abstainVotes = convertToNumber(abstainVotesRaw, decimals);
  const totalVotes = forVotes + againstVotes + abstainVotes;

  const voteMetrics: ArchiveProposalMetrics = {
    kind: "vote",
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

  let metrics: ArchiveProposalMetrics = voteMetrics;

  if (type === "HYBRID_STANDARD") {
    const totalNumeric = forVotes + againstVotes + abstainVotes;
    metrics = {
      kind: "hybridStandard",
      forPercentage: calculatePercentageShare(forVotes, totalNumeric),
      againstPercentage: calculatePercentageShare(againstVotes, totalNumeric),
      abstainPercentage: calculatePercentageShare(abstainVotes, totalNumeric),
    };
  } else if (
    type === "HYBRID_OPTIMISTIC_TIERED" ||
    type === "OPTIMISTIC_TIERED"
  ) {
    const fallbackSupply =
      options.fallbackVotableSupply ??
      (options.namespace
        ? PROPOSAL_DEFAULTS.votableSupply?.[
            options.namespace as keyof typeof PROPOSAL_DEFAULTS.votableSupply
          ]
        : null) ??
      "0";

    const formattedSupply = convertToNumber(fallbackSupply, decimals);
    const againstRelative = formattedSupply
      ? ensurePercentage((againstVotes / formattedSupply) * 100)
      : null;

    const thresholdBps = extractOptimisticThreshold(proposal);
    const thresholdPercent =
      typeof thresholdBps === "number"
        ? ensurePercentage(thresholdBps / 100)
        : null;

    const statusData = deriveHybridOptimisticStatusData(
      normalizedStatus,
      againstRelative,
      thresholdPercent
    );

    metrics = {
      kind: "hybridOptimistic",
      infoText: statusData.infoText,
      statusText: statusData.statusText,
    };
  } else if (type === "OPTIMISTIC") {
    const fallbackSupply =
      options.fallbackVotableSupply ??
      (options.namespace
        ? PROPOSAL_DEFAULTS.votableSupply?.[
            options.namespace as keyof typeof PROPOSAL_DEFAULTS.votableSupply
          ]
        : null) ??
      "0";

    const formattedSupply = convertToNumber(fallbackSupply, decimals);
    const againstRelative = formattedSupply
      ? ensurePercentage((againstVotes / formattedSupply) * 100)
      : null;

    const thresholdBps = extractOptimisticThreshold(proposal);
    const thresholdPercent =
      typeof thresholdBps === "number"
        ? ensurePercentage(thresholdBps / 100)
        : null;

    const summaryParts = [] as string[];
    if (againstRelative != null && thresholdPercent != null) {
      summaryParts.push(
        `${againstRelative}% / ${thresholdPercent}% against needed to defeat`
      );
    } else if (thresholdPercent != null) {
      summaryParts.push(`Against threshold ${thresholdPercent}%`);
    } else if (againstRelative != null) {
      summaryParts.push(`${againstRelative}% against votes`);
    } else {
      summaryParts.push("Optimistic proposal");
    }

    const statusLine =
      againstRelative != null && thresholdPercent != null
        ? `Optimistically ${
            againstRelative <= thresholdPercent ? "approved" : "defeated"
          }`
        : "Optimistic proposal";

    metrics = {
      kind: "optimistic",
      summary: summaryParts.join(" "),
      statusLine,
    };
  } else if (type === "APPROVAL" || type === "HYBRID_APPROVAL") {
    const approvalMetadata = extractApprovalMetadata(proposal);

    metrics = {
      kind: "approval",
      maxApprovals: approvalMetadata.maxApprovals ?? null,
      optionCount: approvalMetadata.optionCount ?? null,
    };
  }

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
  const combined = combineHybridProposals([...proposals]);
  return combined.map((proposal) =>
    normalizeArchiveProposal(proposal, options)
  );
}

function combineHybridProposals(proposals: Record<string, any>[]) {
  const byId = new Map<string, Record<string, any>>();
  proposals.forEach((proposal) => {
    if (proposal && proposal.id != null) {
      byId.set(String(proposal.id), proposal);
    }
  });

  const consumed = new Set<Record<string, any>>();

  proposals.forEach((proposal) => {
    const onchainId = extractOnchainProposalId(proposal);
    if (!onchainId) return;
    const baseProposal = byId.get(onchainId);
    if (!baseProposal || baseProposal === proposal) return;

    if (!Array.isArray(baseProposal.linked_offchain)) {
      baseProposal.linked_offchain = [];
    }
    baseProposal.linked_offchain.push(proposal);
    consumed.add(proposal);
  });

  return proposals.filter((proposal) => !consumed.has(proposal));
}
