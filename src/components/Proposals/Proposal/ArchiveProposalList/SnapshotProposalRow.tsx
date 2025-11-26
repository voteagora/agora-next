"use client";

import { useMemo } from "react";
import Link from "next/link";
import ProposalTimeStatus from "../ProposalTimeStatus.jsx";
import { ArchiveRowProps, RowDisplayData } from "./types";
import { truncateTitle, ensurePercentage } from "./utils";
import { cn, pluralize } from "@/lib/utils";
import { ArchiveListProposal } from "@/lib/types/archiveProposal";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";

// Snapshot voting types
type SnapshotVotingType = "copeland" | "basic" | "approval" | "ranked-choice";

// Type for snapshot-specific fields
type SnapshotProposal = ArchiveListProposal & {
  choices?: string[];
  scores?: number[];
  scores_total?: number;
  type?: SnapshotVotingType;
  state?: string;
  author?: string;
  start?: number;
  end?: number;
  space?: string;
  snapshot_id?: string;
  link?: string; // Direct snapshot link from archive
};

/**
 * Map snapshot state to our status labels
 */
function mapSnapshotState(state: string | undefined): string {
  if (!state) return "closed";
  switch (state.toLowerCase()) {
    case "closed":
      return "closed";
    case "active":
      return "active";
    case "pending":
      return "pending";
    default:
      return "closed";
  }
}

/**
 * Get snapshot link - use the link field from archive data, or construct from ID
 */
function getSnapshotLink(proposal: SnapshotProposal): string {
  // Use the link field if available (from archive data)
  if (!isExternalLink(proposal)) {
    return `/proposals/${proposal.id}`;
  }
  if (proposal.link) {
    return proposal.link;
  }

  // Fallback: construct from ID
  const snapshotId = proposal.snapshot_id || proposal.id;
  const space = proposal.space || "ens.eth";

  // Check if it's a snapshot hash (starts with 0x or Qm)
  if (snapshotId.startsWith("0x") || snapshotId.startsWith("Qm")) {
    return `https://snapshot.box/#/s:${space}/proposal/${snapshotId}`;
  }
  return `/proposals/${proposal.id}`;
}

/**
 * Check if this is an external snapshot link - all snapshot proposals are external
 */
function isExternalLink(proposal: SnapshotProposal): boolean {
  // If we have a link field, it's external
  const isExternal = proposal.link && proposal.type !== "copeland";
  console.log(
    "isExternalLink:",
    proposal.id,
    isExternal,
    proposal.link,
    proposal.type
  );
  if (isExternal) {
    return true;
  }
  return false;
}

/**
 * Extract display data for snapshot proposals
 */
function extractSnapshotDisplayData(
  proposal: SnapshotProposal
): RowDisplayData & { isExternal: boolean } {
  const state = proposal.state || "closed";
  const statusLabel = mapSnapshotState(state);

  // Time data from snapshot format
  const startTime = proposal.start_blocktime ?? proposal.start;
  const endTime = proposal.end_blocktime ?? proposal.end;

  return {
    id: proposal.id,
    href: getSnapshotLink(proposal),
    title: proposal.title || "Untitled Proposal",
    proposerAddress: proposal.author || proposal.proposer || "",
    proposerEns: "",
    statusLabel,
    proposalTypeName: getSnapshotTypeName(proposal.type),
    proposalTypeTag: undefined,
    source: "snapshot",
    hasPendingRanges: false,
    isExternal: isExternalLink(proposal),
    timeStatus: {
      proposalStatus: statusLabel,
      proposalStartTime: startTime ? new Date(Number(startTime) * 1000) : null,
      proposalEndTime: endTime ? new Date(Number(endTime) * 1000) : null,
      proposalCancelledTime: null,
      proposalExecutedTime: null,
    },
  };
}

/**
 * Get display name for snapshot voting type
 */
function getSnapshotTypeName(type: SnapshotVotingType | undefined): string {
  switch (type) {
    case "copeland":
      return "Ranked Choice Proposal"; // copeland uses ranked choice display
    default:
      return "Snapshot Proposal";
  }
}

/**
 * Snapshot-specific status display
 * - closed: purple
 * - active: blue
 * - pending: gray
 */
function SnapshotStatusBadge({ status }: { status: string }) {
  const statusLower = status.toLowerCase();

  const colorClass =
    {
      closed: "text-purple-700",
      active: "text-blue-500",
      pending: "text-secondary",
      executed: "text-positive",
    }[statusLower] || "text-secondary";

  return <div className={`${colorClass} capitalize`}>{status}</div>;
}

type SnapshotMetrics = {
  isBasic: boolean;
  choices: string[];
  scores: number[];
  scoresTotal: number;
};

/**
 * Extract metrics from snapshot proposal
 */
function extractSnapshotMetrics(proposal: SnapshotProposal): SnapshotMetrics {
  const choices = proposal.choices || [];
  const scores = proposal.scores || [];
  const scoresTotal =
    proposal.scores_total || scores.reduce((a, b) => a + b, 0);
  const type = proposal.type || "basic";

  // Check if this is a basic For/Against/Abstain vote
  const isBasic =
    type === "basic" &&
    choices.length === 3 &&
    choices[0]?.toLowerCase() === "for" &&
    choices[1]?.toLowerCase() === "against" &&
    choices[2]?.toLowerCase() === "abstain";

  return {
    isBasic,
    choices,
    scores,
    scoresTotal,
  };
}

/**
 * Snapshot metrics display component
 */
function SnapshotMetricsView({
  metrics,
  votingType,
}: {
  metrics: SnapshotMetrics;
  votingType: SnapshotVotingType | undefined;
}) {
  const { choices } = metrics;

  // For copeland, show "Rank up to X Options"
  if (votingType === "copeland") {
    return (
      <div className="flex flex-col items-end">
        <div className="text-xs text-secondary">Rank up to</div>
        <div className="flex flex-row gap-1">
          {pluralize("Option", choices.length)}
        </div>
      </div>
    );
  }

  // For other non-basic types (approval, single-choice, etc.), show choice count
  return (
    <div className="flex flex-col items-end text-primary">
      {choices.length} Choices
    </div>
  );
}

/**
 * Row component for SNAPSHOT proposals
 */
export function SnapshotProposalRow({ proposal }: ArchiveRowProps) {
  const snapshotProposal = proposal as SnapshotProposal;

  const { displayData, metrics } = useMemo(() => {
    const displayData = extractSnapshotDisplayData(snapshotProposal);
    const metrics = extractSnapshotMetrics(snapshotProposal);
    return { displayData, metrics };
  }, [snapshotProposal]);

  const linkProps = displayData.isExternal
    ? { href: displayData.href, target: "_blank" as const }
    : { href: `/proposals/${proposal.id}` };

  return (
    <Link {...linkProps}>
      <div className="border-b border-line items-center flex flex-row bg-neutral">
        {/* Left column: Title and metadata */}
        <div
          className={cn(
            "flex flex-col whitespace-nowrap overflow-ellipsis overflow-hidden py-4 px-6",
            "w-full sm:w-[55%] items-start justify-center"
          )}
        >
          <div className="flex flex-row text-xs text-secondary gap-1">
            <p>{displayData.proposalTypeName}</p>
            {displayData.isExternal && (
              <ArrowTopRightOnSquareIcon className="w-3 h-3 mt-1" />
            )}
            <div className="block sm:hidden">
              <SnapshotStatusBadge status={displayData.statusLabel} />
            </div>
          </div>
          <div className="overflow-ellipsis overflow-visible whitespace-normal break-words text-primary w-max">
            {truncateTitle(displayData.title)}
          </div>
        </div>

        {/* Middle column: Time and status (tablet+) */}
        <div className="flex-col whitespace-nowrap overflow-ellipsis overflow-hidden py-4 px-6 md:w-[45%] lg:w-[20%] sm:w-[45%] flex-start justify-center hidden sm:block">
          <div className="flex flex-col items-end text-secondary">
            <div className="text-xs">
              <ProposalTimeStatus {...displayData.timeStatus} />
            </div>
            <SnapshotStatusBadge status={displayData.statusLabel} />
          </div>
        </div>

        {/* Right column: Metrics (desktop only) */}
        <div className="flex-col whitespace-nowrap overflow-ellipsis overflow-hidden py-4 px-6 w-[25%] flex-start justify-center hidden lg:block">
          <div className="overflow-hidden overflow-ellipsis">
            <SnapshotMetricsView
              metrics={metrics}
              votingType={snapshotProposal.type}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default SnapshotProposalRow;
