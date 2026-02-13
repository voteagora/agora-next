import Link from "next/link";
import ENSName from "@/components/shared/ENSName";
import Tenant from "@/lib/tenant/tenant";
import { cn } from "@/lib/utils";
import ProposalStatus from "../../ProposalStatus/ProposalStatus";
import ProposalTimeStatus from "../ProposalTimeStatus.jsx";
import { RowDisplayData } from "./types";
import { truncateTitle } from "./utils";

type BaseRowLayoutProps = {
  data: RowDisplayData;
  /** Metrics component to render in the right column */
  metricsContent: React.ReactNode;
  proposalTypeName: string;
};

/**
 * Shared layout for all archive proposal rows.
 * Each proposal type provides its own metrics content.
 */
export function BaseRowLayout({
  data,
  metricsContent,
  proposalTypeName,
}: BaseRowLayoutProps) {
  const { ui } = Tenant.current();
  const isOODao = data.source === "eas-oodao";

  const statusProposal = {
    status: data.statusLabel,
    id: data.id,
  } as const;
  return (
    <Link href={data.href}>
      <div className="border-b border-line items-center flex flex-row bg-neutral">
        {/* Left column: Title and metadata */}
        <div
          className={cn(
            "flex flex-col whitespace-nowrap overflow-ellipsis overflow-hidden py-4 px-6",
            "w-full sm:w-[55%] items-start justify-center"
          )}
        >
          {isOODao ? (
            <OODaoBadges
              data={data}
              statusProposal={statusProposal}
              proposalTypeName={proposalTypeName}
            />
          ) : (
            <StandardHeader
              data={data}
              statusProposal={statusProposal}
              organizationTitle={ui.organization?.title}
            />
          )}
          <div className="overflow-ellipsis overflow-visible whitespace-normal break-words text-primary">
            {truncateTitle(data.title)}
          </div>
        </div>

        {/* Middle column: Time and status (tablet+) */}
        <div className="flex-col whitespace-nowrap overflow-ellipsis overflow-hidden py-4 px-6 md:w-[45%] lg:w-[20%] sm:w-[45%] flex-start justify-center hidden sm:block">
          <div className="flex flex-col items-end text-secondary">
            <div className="text-xs">
              <ProposalTimeStatus {...data.timeStatus} />
            </div>
            <ProposalStatus proposal={statusProposal} />
          </div>
        </div>

        {/* Right column: Metrics (desktop only) */}
        <div className="flex-col whitespace-nowrap overflow-ellipsis overflow-hidden py-4 px-6 w-[25%] flex-start justify-center hidden lg:block">
          <div className="overflow-hidden overflow-ellipsis">
            {metricsContent}
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * Badge-style header for eas-oodao proposals
 */
function OODaoBadges({
  data,
  statusProposal,
  proposalTypeName,
}: {
  data: RowDisplayData;
  statusProposal: { status: string; id: string };
  proposalTypeName: string;
}) {
  const tagBackground = Tenant.current().ui.customization?.tagBackground;
  const tagBgStyle = tagBackground
    ? {
        backgroundColor: tagBackground.startsWith("#")
          ? tagBackground
          : `rgb(${tagBackground})`,
      }
    : undefined;
  const tagTextClass = tagBackground ? "text-white" : "text-neutral-700";
  const tagBgClass = tagBackground ? "" : "bg-black/10";

  return (
    <div className="inline-flex justify-start items-center gap-1.5 flex-wrap">
      {/* Tag badge */}
      {data.proposalTypeTag && (
        <div
          className={`px-2 py-0.5 rounded-[3px] flex justify-center items-center gap-0.5 ${tagBgClass}`}
          style={tagBgStyle}
        >
          <div className={`${tagTextClass} text-xs font-semibold leading-4`}>
            {data.proposalTypeTag === "Gov Proposal"
              ? `⚖️️ ${data.proposalTypeTag}`
              : `🌡️ ${data.proposalTypeTag}`}
          </div>
        </div>
      )}

      {/* Author badge */}
      <div
        className={`px-2 py-0.5 rounded-[3px] flex justify-center items-center gap-0.5 ${tagBgClass}`}
        style={tagBgStyle}
      >
        <div className={`${tagTextClass} text-xs font-semibold leading-4`}>
          By{" "}
          {data.proposerEns ? (
            data.proposerEns
          ) : (
            <ENSName address={data.proposerAddress} />
          )}
        </div>
      </div>

      {/* Proposal type badge */}
      <div
        className={`px-2 py-0.5 rounded-[3px] flex justify-center items-center gap-0.5 ${tagBgClass} ${
          data.hasPendingRanges ? "opacity-50" : ""
        }`}
        style={tagBgStyle}
      >
        <div className={`${tagTextClass} text-xs font-semibold leading-4`}>
          {proposalTypeName}
        </div>
      </div>

      {/* Mobile status */}
      <div className="block sm:hidden">
        <ProposalStatus proposal={statusProposal} />
      </div>
    </div>
  );
}

/**
 * Text-style header for non-oodao proposals
 */
function StandardHeader({
  data,
  statusProposal,
  organizationTitle,
}: {
  data: RowDisplayData;
  statusProposal: { status: string; id: string };
  organizationTitle?: string;
}) {
  return (
    <div className="flex flex-row text-xs text-secondary gap-1">
      <div>
        {data.proposalTypeName}{" "}
        <span className="hidden sm:inline"> by The {organizationTitle}</span>
      </div>
      <div className="block sm:hidden">
        <ProposalStatus proposal={statusProposal} />
      </div>
    </div>
  );
}
