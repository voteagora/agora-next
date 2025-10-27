import Link from "next/link";

import ENSName from "@/components/shared/ENSName";
import Tenant from "@/lib/tenant/tenant";
import { cn } from "@/lib/utils";
import ProposalStatus from "../../ProposalStatus/ProposalStatus";
import ProposalTimeStatus from "../ProposalTimeStatus.jsx";

import {
  ArchiveProposalDisplay,
  ArchiveProposalMetrics,
  formatArchiveTagLabel,
} from "./normalizeArchiveProposal";
import { OPStandardStatusView } from "../OPStandardProposalStatus";

type ArchiveProposalRowProps = {
  proposal: ArchiveProposalDisplay;
};

const truncate = (value: string) =>
  value.length > 80 ? `${value.slice(0, 80)}...` : value;

const renderMetrics = (
  metrics: ArchiveProposalMetrics,
  tokenDecimals: number
) => {
  switch (metrics.kind) {
    case "standard": {
      return (
        <OPStandardStatusView
          forAmount={metrics.forRaw}
          againstAmount={metrics.againstRaw}
          abstainAmount={metrics.abstainRaw}
          decimals={tokenDecimals}
        />
      );
    }

    default: {
      return (
        <div className="flex flex-col items-end text-xs text-secondary">
          proposal type is not supported
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

  const isEasOodaoSource = proposal.source === "eas-oodao";
  const primaryTagLabel = isEasOodaoSource
    ? (formatArchiveTagLabel(proposal.tags?.[0]) ??
      proposal.tags?.[0] ??
      "Temp Check")
    : "Gov Proposal";

  return (
    <Link href={proposal.href}>
      <div className="border-b border-line items-center flex flex-row bg-neutral">
        <div
          className={cn(
            "flex flex-col whitespace-nowrap overflow-ellipsis overflow-hidden py-4 px-6",
            "w-full sm:w-[55%] items-start justify-center"
          )}
        >
          <div className="inline-flex justify-start items-center gap-1.5 flex-wrap">
            {/* Tag badge */}
            {primaryTagLabel && (
              <div className="px-2 py-0.5 bg-black/10 rounded-[3px] flex justify-center items-center gap-0.5">
                <div className="text-neutral-700 text-xs font-semibold leading-4">
                  {isEasOodaoSource
                    ? `🌡️ ${primaryTagLabel}`
                    : `⚖️️ ${primaryTagLabel}`}
                </div>
              </div>
            )}

            {/* Author badge */}
            <div className="px-2 py-0.5 bg-black/10 rounded-[3px] flex justify-center items-center gap-0.5">
              <div className="text-neutral-700 text-xs font-semibold leading-4">
                By{" "}
                {proposal.proposerEns ? (
                  proposal.proposerEns
                ) : (
                  <ENSName address={proposal.proposerAddress} />
                )}
              </div>
            </div>

            {/* Proposal type badge */}
            <div className="px-2 py-0.5 bg-black/10 rounded-[3px] flex justify-center items-center gap-0.5">
              <div className="text-neutral-700 text-xs font-semibold leading-4">
                {proposal.typeLabel}
              </div>
            </div>

            {/* Mobile status */}
            <div className="block sm:hidden">
              <ProposalStatus proposal={statusProposal} />
            </div>
          </div>
          <div className="overflow-ellipsis overflow-visible whitespace-normal break-words text-primary mt-1">
            {truncate(proposal.title)}
          </div>
        </div>

        <div className="flex-col whitespace-nowrap overflow-ellipsis overflow-hidden py-4 px-6 md:w-[45%] lg:w-[20%] sm:w-[45%] flex-start justify-center hidden sm:block">
          <div className="flex flex-col items-end text-secondary">
            <div className="text-xs">
              <ProposalTimeStatus {...proposal.timeStatus} />
            </div>
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
