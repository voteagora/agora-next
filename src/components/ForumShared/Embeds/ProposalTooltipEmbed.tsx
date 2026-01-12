"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import ProposalStatus from "@/components/Proposals/ProposalStatus/ProposalStatus";
import ProposalTimeStatus from "@/components/Proposals/Proposal/ProposalTimeStatus";
import { OPStandardStatusView } from "@/components/Proposals/Proposal/OPStandardProposalStatus";
import Tenant from "@/lib/tenant/tenant";
import { cn } from "@/lib/utils";

type ProposalEmbedData = {
  id: string;
  title: string;
  status: string;
  proposer: string;
  proposalType: string;
  voteStats?: {
    for: string;
    against: string;
    abstain: string;
    forRaw?: string;
    againstRaw?: string;
    abstainRaw?: string;
    forPercentage: number;
    againstPercentage: number;
    abstainPercentage: number;
    quorum?: string;
  };
  startTime?: string;
  endTime?: string;
  url: string;
};

type ProposalTooltipEmbedProps = {
  proposalId: string;
};

export default function ProposalTooltipEmbed({
  proposalId,
}: ProposalTooltipEmbedProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["proposal-embed", proposalId],
    queryFn: async () => {
      const response = await fetch(`/api/embeds/proposal/${proposalId}`);
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json() as Promise<ProposalEmbedData>;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { ui } = Tenant.current();
  const useNeutral =
    ui.toggle("syndicate-colours-fix-delegate-pages")?.enabled ?? false;

  if (isLoading) {
    return (
      <div
        className={cn(
          "w-[600px] rounded-xl border border-line p-7 animate-pulse shadow-newDefault",
          useNeutral ? "bg-neutral" : "bg-wash"
        )}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-line rounded w-1/4"></div>
            <div className="h-3 bg-line rounded w-32"></div>
          </div>
          <div className="h-5 bg-line rounded w-full"></div>
          <div className="h-5 bg-line rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return null;
  }

  const { token } = Tenant.current();
  const statusProposal = {
    status: data.status,
    id: data.id,
  } as const;

  const timeStatus = {
    proposalStatus: data.status,
    proposalStartTime: data.startTime ? new Date(data.startTime) : null,
    proposalEndTime: data.endTime ? new Date(data.endTime) : null,
    proposalCancelledTime: null,
    proposalExecutedTime: null,
  };

  const decimals = token.decimals ?? 18;
  const hasVoteStats =
    data.voteStats &&
    data.voteStats.forRaw &&
    data.voteStats.againstRaw &&
    data.voteStats.abstainRaw;

  return (
    <Link
      href={data.url}
      className="block no-underline hover:no-underline [&_*]:no-underline [&_*]:hover:no-underline"
    >
      <div
        className={cn(
          "w-[600px] flex flex-col rounded-xl border border-line shadow-newDefault overflow-hidden hover:shadow-newHover transition-shadow p-4",
          useNeutral ? "bg-neutral" : "bg-wash"
        )}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-md font-semibold text-primary line-clamp-2 flex-1 my-0">
              {data.title}
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-xs text-secondary flex-shrink-0">
                <ProposalTimeStatus {...timeStatus} />
                <span>•</span>
                <ProposalStatus proposal={statusProposal} />
              </div>
              {hasVoteStats && data.voteStats && (
                <div className="flex flex-col gap-4">
                  <OPStandardStatusView
                    forAmount={data.voteStats.forRaw!}
                    againstAmount={data.voteStats.againstRaw!}
                    abstainAmount={data.voteStats.abstainRaw!}
                    decimals={decimals}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
