"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { DelegateProfileImageWithMetadata } from "@/components/Delegates/DelegateCard/DelegateProfileImage";
import { PanelRow } from "@/components/Delegates/DelegateCard/DelegateCard";
import Tenant from "@/lib/tenant/tenant";
import { sanitizeContent } from "@/lib/sanitizationUtils";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/tokenUtils";

type DelegateEmbedData = {
  address: string;
  votingPower: string;
  votingPowerRaw?: string;
  delegatorsCount: number;
  proposalsCreated: number;
  voteStats?: {
    forVotes: number;
    againstVotes: number;
    abstainVotes: number;
  };
  statement?: string;
  url: string;
};

type DelegateTooltipEmbedProps = {
  addressOrENSName: string;
};

export default function DelegateTooltipEmbed({
  addressOrENSName,
}: DelegateTooltipEmbedProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["delegate-embed", addressOrENSName],
    queryFn: async () => {
      const response = await fetch(`/api/embeds/delegate/${addressOrENSName}`);
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json() as Promise<DelegateEmbedData>;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { ui } = Tenant.current();

  if (isLoading) {
    return (
      <div className="w-80 border border-line rounded-xl p-7 animate-pulse bg-neutral shadow-newDefault">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-line rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-line rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-line rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return null;
  }

  const useNeutral =
    ui.toggle("syndicate-colours-fix-delegate-pages")?.enabled ?? false;

  const sanitizedStatement = data.statement
    ? sanitizeContent(data.statement)
    : "";

  const votingPowerRaw = data.votingPowerRaw
    ? BigInt(data.votingPowerRaw)
    : BigInt(0);

  return (
    <Link
      href={data.url}
      className="block no-underline hover:no-underline [&_*]:no-underline [&_*]:hover:no-underline"
    >
      <div
        className={cn(
          "w-80 flex flex-col rounded-xl border border-line shadow-newDefault overflow-hidden hover:shadow-newHover transition-shadow",
          useNeutral ? "bg-neutral" : "bg-wash"
        )}
      >
        <div className="flex flex-col items-stretch p-7 gap-4 [&_a]:no-underline [&_a]:hover:no-underline">
          <DelegateProfileImageWithMetadata
            address={data.address}
            votingPower={votingPowerRaw.toString()}
            endorsed={false}
            description={sanitizedStatement}
            showVotingPower={false}
          />
        </div>

        <div className="flex flex-col p-7 border-t border-line gap-4">
          <PanelRow
            title="Voting power"
            detail={formatNumber(votingPowerRaw)}
          />
          <PanelRow
            title="Delegated addresses"
            detail={data.delegatorsCount.toString()}
          />
          <PanelRow
            title="Proposals created"
            detail={data.proposalsCreated.toString()}
          />
          {data.voteStats &&
            (data.voteStats.forVotes > 0 ||
              data.voteStats.againstVotes > 0 ||
              data.voteStats.abstainVotes > 0) && (
              <PanelRow
                title="For/Against/Abstain"
                detail={
                  <div className="flex flex-row gap-2">
                    <span className="text-positive font-bold border border-line rounded-md px-2 py-1">
                      {data.voteStats.forVotes}
                    </span>
                    <span className="text-negative font-bold border border-line rounded-md px-2 py-1">
                      {data.voteStats.againstVotes}
                    </span>
                    <span className="text-tertiary font-bold border border-line rounded-md px-2 py-1">
                      {data.voteStats.abstainVotes}
                    </span>
                  </div>
                }
              />
            )}
        </div>
      </div>
    </Link>
  );
}
