import Link from "next/link";
import { formatNumber, TokenAmountDisplay } from "@/lib/utils";
import { PROPOSAL_DEFAULTS } from "@/app/proposals/data/constants";
import ENSName from "@/components/shared/ENSName";

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
 * Simplified proposal row component for archived proposals
 * Uses JSON data directly without complex transformations
 */
export default function ArchiveProposalRow({
  proposal,
}: {
  proposal: ArchiveProposal;
}) {
  // Extract vote totals from JSON structure
  const forVotes = proposal.totals?.["no-param"]?.["1"] || "0";
  const againstVotes = proposal.totals?.["no-param"]?.["0"] || "0";
  const abstainVotes = proposal.totals?.["no-param"]?.["2"] || "0";

  // Calculate formatted numbers
  const forLength = Number(formatNumber(forVotes, 18));
  const againstLength = Number(formatNumber(againstVotes, 18));
  const abstainLength = Number(formatNumber(abstainVotes, 18));
  const totalLength = forLength + againstLength + abstainLength;

  // Determine proposal status
  const getStatus = () => {
    if (proposal.cancel_event) return "Cancelled";
    if (proposal.execute_event) return "Executed";
    if (proposal.queue_event) return "Queued";
    
    const now = Math.floor(Date.now() / 1000);
    const endTime = Number(proposal.end_blocktime) || 0;
    
    if (endTime > now) return "Active";
    
    // Simple majority check for succeeded/defeated
    if (forLength > againstLength) return "Succeeded";
    return "Defeated";
  };

  const status = getStatus();

  // Get title - use from JSON or fallback
  const title = proposal.title || 
                proposal.description?.split("\n")[0]?.replace(/^#\s*/, "") || 
                PROPOSAL_DEFAULTS.title;

  // Status styling
  const getStatusClass = () => {
    switch (status) {
      case "Active":
        return "text-positive";
      case "Succeeded":
      case "Executed":
        return "text-positive";
      case "Defeated":
        return "text-negative";
      case "Queued":
        return "text-tertiary";
      default:
        return "text-secondary";
    }
  };

  // Time display
  const getTimeDisplay = () => {
    if (!proposal.start_blocktime) return "";
    
    const startTimestamp = Number(proposal.start_blocktime);
    const startDate = new Date(startTimestamp * 1000);
    const now = new Date();
    const endTimestamp = Number(proposal.end_blocktime) || 0;
    const endDate = endTimestamp ? new Date(endTimestamp * 1000) : null;

    if (status === "Executed" && proposal.execute_event) {
      return "Executed";
    }
    if (status === "Cancelled") {
      return "Cancelled";
    }
    if (status === "Queued") {
      return "Queued";
    }
    if (endDate && endDate > now) {
      const days = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return `${days}d left`;
    }
    if (endDate) {
      return "Ended";
    }
    return "Active";
  };

  return (
    <Link href={`/proposals/${proposal.id}`}>
      <div className="border-b border-line items-center flex flex-row bg-neutral">
        {/* Title and Proposer Section */}
        <div className="flex flex-col whitespace-nowrap overflow-ellipsis overflow-hidden py-4 px-6 w-full sm:w-[55%] items-start justify-center">
          <div className="flex flex-row text-xs text-secondary gap-1">
            <div>
              Standard proposal{" "}
              <span className="hidden sm:inline">
                by <ENSName address={proposal.proposer} />
              </span>
            </div>
            <div className="block sm:hidden">
              <span className={getStatusClass()}>{status}</span>
            </div>
          </div>
          <div className="overflow-ellipsis overflow-visible whitespace-normal break-words text-primary">
            {title.length > 80 ? `${title.slice(0, 80)}...` : title}
          </div>
        </div>

        {/* Status and Time Section */}
        <div className="flex-col whitespace-nowrap overflow-ellipsis overflow-hidden py-4 px-6 md:w-[45%] lg:w-[20%] sm:w-[45%] flex-start justify-center hidden sm:block">
          <div className="flex flex-col items-end">
            <div className="text-xs text-secondary">{getTimeDisplay()}</div>
            <span className={`text-sm ${getStatusClass()}`}>{status}</span>
          </div>
        </div>

        {/* Vote Results Section */}
        <div className="flex-col whitespace-nowrap overflow-ellipsis overflow-hidden py-4 px-6 w-[25%] flex-start justify-center hidden lg:block">
          <div className="overflow-hidden overflow-ellipsis">
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
          </div>
        </div>
      </div>
    </Link>
  );
}
