"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ENSName from "@/components/shared/ENSName";
import { format } from "date-fns";

type ProposalEmbedData = {
  id: string;
  title: string;
  status: string;
  proposer: string;
  proposalType: string;
  voteStats?: {
    forPercentage: number;
    againstPercentage: number;
    abstainPercentage: number;
    quorum?: string;
  };
  startTime?: string;
  endTime?: string;
  url: string;
};

type ProposalEmbedProps = {
  proposalId: string;
};

const getStatusColor = (status: string): string => {
  const statusLower = status.toLowerCase();
  const approved = ["succeeded", "executed", "queued", "passed"];
  const rejected = ["defeated", "expired", "cancelled", "vetoed", "failed"];
  const pending = ["pending"];
  const active = ["active"];

  if (approved.includes(statusLower)) return "text-positive";
  if (rejected.includes(statusLower)) return "text-negative";
  if (pending.includes(statusLower)) return "text-secondary";
  if (active.includes(statusLower)) return "text-blue-500";
  return "text-secondary";
};

export default function ProposalEmbed({ proposalId }: ProposalEmbedProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["proposal-embed", proposalId],
    queryFn: async () => {
      const response = await fetch(`/api/embeds/proposal/${proposalId}`);
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json() as Promise<ProposalEmbedData>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="my-3 border border-line rounded-xl p-4 animate-pulse bg-tertiary/10 shadow-newDefault">
        <div className="h-4 bg-line rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-line rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-line rounded w-full"></div>
      </div>
    );
  }

  if (isError || !data) {
    return null; // Fail silently, keep the original link
  }

  const statusColor = getStatusColor(data.status);
  const isEnded = data.endTime ? new Date(data.endTime) < new Date() : false;

  return (
    <Link
      href={data.url}
      className="block my-3 !no-underline !decoration-none hover:!no-underline prose-a:!no-underline group"
    >
      <div className="border border-line rounded-xl p-4 bg-cardBackground shadow-newDefault hover:shadow-newHover transition-shadow [&_*]:!no-underline [&_*]:!decoration-none">
        <div className="flex items-center gap-2 mb-2">
          <span className={cn("text-xs font-semibold capitalize", statusColor)}>
            {data.status.toLowerCase()}
          </span>
          {data.endTime && (
            <>
              <span className="text-tertiary">•</span>
              <span className="text-xs text-secondary">
                {isEnded ? "Ended" : "Ends"}{" "}
                {format(new Date(data.endTime), "MMM dd, yyyy h:mm aaa")}
              </span>
            </>
          )}
        </div>

        <h3 className="text-base font-semibold text-primary line-clamp-2 mb-2 group-hover:opacity-80 transition-opacity mt-0">
          {data.title}
        </h3>

        <div className="text-xs text-secondary mb-3">
          Proposed by <ENSName address={data.proposer} />
        </div>

        {data.voteStats && (
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-positive font-bold">
                  {data.voteStats.forPercentage}%
                </span>
                <span className="text-secondary">For</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-negative font-bold">
                  {data.voteStats.againstPercentage}%
                </span>
                <span className="text-secondary">Against</span>
              </div>
              {data.voteStats.abstainPercentage > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-tertiary font-bold">
                    {data.voteStats.abstainPercentage}%
                  </span>
                  <span className="text-secondary">Abstain</span>
                </div>
              )}
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden bg-line">
              {data.voteStats.forPercentage > 0 && (
                <div
                  className="bg-positive"
                  style={{ width: `${data.voteStats.forPercentage}%` }}
                />
              )}
              {data.voteStats.againstPercentage > 0 && (
                <div
                  className="bg-negative"
                  style={{ width: `${data.voteStats.againstPercentage}%` }}
                />
              )}
              {data.voteStats.abstainPercentage > 0 && (
                <div
                  className="bg-tertiary"
                  style={{ width: `${data.voteStats.abstainPercentage}%` }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
