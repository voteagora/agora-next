"use client";

import Link from "next/link";
import { cn, TokenAmountDisplay } from "@/lib/utils";
import { PROPOSAL_DEFAULTS } from "@/app/proposals/data/constants";
import ENSName from "@/components/shared/ENSName";
import { HStack } from "@/components/Layout/Stack";
import { format } from "date-fns";
import { formatUnits } from "ethers";

/**
 * Archive Proposal Data Structure (from JSON)
 */
type ArchiveProposal = {
  id: string;
  proposer: string;
  block_number?: string;
  start_block: number | string;
  end_block?: number | string | null;
  start_blocktime?: number;
  end_blocktime?: number;
  proposal_type?: number;
  voting_module_name?: string;
  totals?: {
    "no-param"?: {
      "0"?: string; // against
      "1"?: string; // for
      "2"?: string; // abstain
    };
  };
  queue_event?: any;
  execute_event?: any;
  cancel_event?: any;
  description?: string;
  title?: string;
};

/**
 * Standard proposal component for archived proposals
 * Maintains exact same styling and time format as original Proposal component
 */
export default function ArchiveStandardProposal({
  proposal,
}: {
  proposal: ArchiveProposal;
}) {
  // Extract vote totals from JSON structure
  const forVotes = proposal.totals?.["no-param"]?.["1"] || "0";
  const againstVotes = proposal.totals?.["no-param"]?.["0"] || "0";
  const abstainVotes = proposal.totals?.["no-param"]?.["2"] || "0";

  // Helper function to convert wei to number (matching OPStandardProposalStatus)
  const convertToNumber = (amount: string | null | undefined) => {
    if (amount == null) return 0;
    try {
      return Number(formatUnits(amount, 18));
    } catch (error) {
      console.error("Error formatting number:", error);
      return 0;
    }
  };

  // Calculate numerical values for percentage calculations
  const forLength = convertToNumber(forVotes);
  const againstLength = convertToNumber(againstVotes);
  const abstainLength = convertToNumber(abstainVotes);
  const totalLength = forLength + againstLength + abstainLength;
  // Determine proposal status
  const getStatus = () => {
    if (proposal.cancel_event) return "CANCELLED";
    if (proposal.execute_event) return "EXECUTED";
    if (proposal.queue_event) return "QUEUED";

    const now = Math.floor(Date.now() / 1000);
    const endTime = Number(proposal.end_blocktime) || 0;

    if (endTime > now) return "ACTIVE";

    // Simple majority check for succeeded/defeated
    if (forLength > againstLength) return "SUCCEEDED";
    return "DEFEATED";
  };

  const status = getStatus();

  // Get title - use from JSON or fallback
  const title =
    proposal.title ||
    proposal.description?.split("\n")[0]?.replace(/^#\s*/, "") ||
    PROPOSAL_DEFAULTS.title;

  // Status badge component matching ProposalStatus
  const StatusBadge = () => {
    const getStatusClass = () => {
      switch (status) {
        case "ACTIVE":
          return "text-blue-500";
        case "SUCCEEDED":
        case "EXECUTED":
          return "text-positive";
        case "DEFEATED":
          return "text-negative";
        case "QUEUED":
          return "text-tertiary";
        case "CANCELLED":
          return "text-secondary";
        default:
          return "text-secondary";
      }
    };

    const getStatusLabel = () => {
      switch (status) {
        case "ACTIVE":
          return "Active";
        case "SUCCEEDED":
          return "Succeeded";
        case "DEFEATED":
          return "Defeated";
        case "EXECUTED":
          return "Executed";
        case "QUEUED":
          return "Queued";
        case "CANCELLED":
          return "Cancelled";
        default:
          return status;
      }
    };

    return (
      <span className={`text-sm ${getStatusClass()}`}>{getStatusLabel()}</span>
    );
  };

  // Time display matching ProposalTimeStatus format
  const TimeDisplay = () => {
    const startTime = proposal.start_blocktime
      ? new Date(Number(proposal.start_blocktime) * 1000)
      : null;
    const endTime = proposal.end_blocktime
      ? new Date(Number(proposal.end_blocktime) * 1000)
      : null;
    const cancelledTime = proposal.cancel_event?.blocktime
      ? new Date(Number(proposal.cancel_event.blocktime) * 1000)
      : null;
    const executedTime = proposal.execute_event?.blocktime
      ? new Date(Number(proposal.execute_event.blocktime) * 1000)
      : null;

    const activeProposalEndTime = endTime
      ? format(endTime, "h:mm aaa MMM dd, yyyy")
      : null;
    const _proposalCancelledTime = cancelledTime
      ? format(cancelledTime, "h:mm aaa MMM dd, yyyy")
      : null;
    const finishProposalEndTime = endTime
      ? format(endTime, "h:mm aaa MMM dd, yyyy")
      : null;
    const _proposalExecutedTime = executedTime
      ? format(executedTime, "h:mm aaa MMM dd, yyyy")
      : null;

    switch (status) {
      case "ACTIVE":
        return <HStack gap={1}>Ends {activeProposalEndTime}</HStack>;

      case "CANCELLED":
        return <HStack gap={1}>Cancelled {_proposalCancelledTime}</HStack>;

      case "EXECUTED":
        return <HStack gap={1}>Executed {_proposalExecutedTime}</HStack>;

      default:
        return <HStack gap={1}>Ended {finishProposalEndTime}</HStack>;
    }
  };

  // Vote results display matching OPStandardProposalStatus
  const VoteResults = () => (
    <div className="flex flex-col items-end gap-1 justify-center">
      <div className="flex flex-row space-between text-primary gap-1">
        <div>
          {TokenAmountDisplay({
            amount: forVotes,
            currency: "",
          })}{" "}
          For
        </div>
        <div>–</div>
        <div>
          {TokenAmountDisplay({
            amount: againstVotes,
            currency: "",
          })}{" "}
          Against
        </div>
      </div>

      {totalLength > 0 && (
        <div className="flex w-52 h-1 bg-wash rounded-full">
          <div
            className="bg-positive h-1 rounded-l-full"
            style={{ width: `${(forLength / totalLength) * 100}%` }}
          ></div>
          <div
            className="bg-tertiary h-1"
            style={{ width: `${(abstainLength / totalLength) * 100}%` }}
          ></div>
          <div
            className="bg-negative h-1 rounded-r-full"
            style={{ width: `${(againstLength / totalLength) * 100}%` }}
          ></div>
        </div>
      )}

      {totalLength === 0 && (
        <div className="flex w-52 h-1 bg-wash rounded-full">
          <div className="bg-tertiary h-1" style={{ width: `100%` }}></div>
        </div>
      )}
    </div>
  );

  return (
    <Link href={`/proposals/${proposal.id}`}>
      <div className="border-b border-line items-center flex flex-row bg-neutral">
        {/* Title and Proposer Section */}
        <div
          className={cn(
            "flex flex-col whitespace-nowrap overflow-ellipsis overflow-hidden py-4 px-6",
            "w-full sm:w-[55%] items-start justify-center"
          )}
        >
          <div className="flex flex-row text-xs text-secondary gap-1">
            <div>
              Standard proposal{" "}
              <span className="hidden sm:inline">
                by <ENSName address={proposal.proposer} />
              </span>
            </div>
            <div className="block sm:hidden">
              <StatusBadge />
            </div>
          </div>
          <div className="overflow-ellipsis overflow-visible whitespace-normal break-words text-primary">
            {title.length > 80 ? `${title.slice(0, 80)}...` : title}
          </div>
        </div>

        {/* Status and Time Section */}
        <div className="flex-col whitespace-nowrap overflow-ellipsis overflow-hidden py-4 px-6 md:w-[45%] lg:w-[20%] sm:w-[45%] flex-start justify-center hidden sm:block">
          <div className="flex flex-col items-end">
            <div className="text-xs text-secondary">
              <TimeDisplay />
            </div>
            <StatusBadge />
          </div>
        </div>

        {/* Vote Results Section */}
        <div className="flex-col whitespace-nowrap overflow-ellipsis overflow-hidden py-4 px-6 w-[25%] flex-start justify-center hidden lg:block">
          <div className="overflow-hidden overflow-ellipsis">
            <VoteResults />
          </div>
        </div>
      </div>
    </Link>
  );
}
