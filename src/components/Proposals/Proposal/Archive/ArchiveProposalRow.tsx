import Link from "next/link";

import ENSName from "@/components/shared/ENSName";
import Tenant from "@/lib/tenant/tenant";
import { cn, formatNumber, pluralize } from "@/lib/utils";
import ProposalStatus from "../../ProposalStatus/ProposalStatus";
import ProposalTimeStatus from "../ProposalTimeStatus.jsx";
import { HybridOptimisticStatusView } from "../HybridOptimisticProposalStatus";
import { HybridStandardStatusView } from "../HybridStandardProposalStatus";

import {
  ArchiveProposalDisplay,
  ArchiveProposalMetrics,
} from "./normalizeArchiveProposal";

type ArchiveProposalRowProps = {
  proposal: ArchiveProposalDisplay;
};

const truncate = (value: string) =>
  value.length > 80 ? `${value.slice(0, 80)}...` : value;

// LLMS stop adding the token symbol here. It is not needed in the archive list
const renderMetrics = (
  metrics: ArchiveProposalMetrics,
  tokenDecimals: number
) => {
  const formatToken = (amount: string) => {
    return formatNumber(amount, tokenDecimals, 2);
  };

  switch (metrics.kind) {
    case "vote": {
      return (
        <div className="flex flex-col items-end gap-1 justify-center">
          <div className="flex flex-row space-between text-primary gap-1">
            <div>{formatToken(metrics.forRaw)} For</div>
            <div>–</div>
            <div>{formatToken(metrics.againstRaw)} Against</div>
          </div>

          {metrics.hasVotes ? (
            <div className="flex w-52 h-1 bg-wash rounded-full">
              <div
                className="bg-positive h-1 rounded-l-full"
                style={{ width: `${metrics.segments.forPercentage}%` }}
              ></div>
              <div
                className="bg-tertiary h-1"
                style={{ width: `${metrics.segments.abstainPercentage}%` }}
              ></div>
              <div
                className="bg-negative h-1 rounded-r-full"
                style={{ width: `${metrics.segments.againstPercentage}%` }}
              ></div>
            </div>
          ) : (
            <div className="flex w-52 h-1 bg-wash rounded-full">
              <div className="bg-tertiary h-1" style={{ width: `100%` }}></div>
            </div>
          )}
        </div>
      );
    }

    case "optimistic": {
      return (
        <div className="flex flex-col text-right text-primary">
          <div className="text-xs text-secondary">{metrics.summary}</div>
          <p>{metrics.statusLine}</p>
        </div>
      );
    }

    case "hybridOptimistic": {
      return (
        <HybridOptimisticStatusView
          infoText={metrics.infoText}
          statusText={metrics.statusText}
        />
      );
    }

    case "hybridStandard": {
      return (
        <HybridStandardStatusView
          forPercentage={metrics.forPercentage}
          againstPercentage={metrics.againstPercentage}
          abstainPercentage={metrics.abstainPercentage}
        />
      );
    }

    case "approval": {
      const maxApprovalsText =
        metrics.maxApprovals != null ? metrics.maxApprovals : "-";
      const optionCount = metrics.optionCount ?? 0;

      return (
        <div className="flex flex-col items-end">
          <div className="text-xs text-secondary">
            Select {maxApprovalsText} of
          </div>
          <div className="flex flex-row gap-1">
            {pluralize("Option", optionCount)}
          </div>
        </div>
      );
    }

    default: {
      return (
        <div className="flex flex-col items-end text-xs text-secondary">
          {metrics.message ?? "No vote data"}
        </div>
      );
    }
  }
};

export default function ArchiveProposalRow({
  proposal,
}: ArchiveProposalRowProps) {
  const { token } = Tenant.current();
  const tokenDecimals = token.decimals ?? 18;
  const statusProposal = {
    status: proposal.statusLabel,
    id: proposal.id,
  } as const;

  return (
    <Link href={proposal.href}>
      <div className="border-b border-line items-center flex flex-row bg-neutral">
        <div
          className={cn(
            "flex flex-col whitespace-nowrap overflow-ellipsis overflow-hidden py-4 px-6",
            "w-full sm:w-[55%] items-start justify-center"
          )}
        >
          <div className="flex flex-row text-xs text-secondary gap-1">
            <div>
              {proposal.typeLabel}{" "}
              <span className="hidden sm:inline">
                by <ENSName address={proposal.proposerAddress} />
              </span>
            </div>
            <div className="block sm:hidden">
              <ProposalStatus proposal={statusProposal} />
            </div>
          </div>
          <div className="overflow-ellipsis overflow-visible whitespace-normal break-words text-primary">
            {truncate(proposal.title)}
          </div>
        </div>

        <div className="flex-col whitespace-nowrap overflow-ellipsis overflow-hidden py-4 px-6 md:w-[45%] lg:w-[20%] sm:w-[45%] flex-start justify-center hidden sm:block">
          <div className="flex flex-col items-end text-xs text-secondary">
            <ProposalTimeStatus {...proposal.timeStatus} />
            <ProposalStatus proposal={statusProposal} />
          </div>
        </div>

        <div className="flex-col whitespace-nowrap overflow-ellipsis overflow-hidden py-4 px-6 w-[25%] flex-start justify-center hidden lg:block">
          <div className="overflow-hidden overflow-ellipsis">
            {renderMetrics(proposal.metrics, tokenDecimals)}
          </div>
        </div>
      </div>
    </Link>
  );
}
