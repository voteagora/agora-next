"use client";

import ENSAvatar from "@/components/shared/ENSAvatar";
import ENSName from "@/components/shared/ENSName";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

type DelegateEmbedData = {
  address: string;
  displayName: string;
  votingPower: string;
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

type DelegateEmbedProps = {
  addressOrENSName: string;
};

export default function DelegateEmbed({
  addressOrENSName,
}: DelegateEmbedProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["delegate-embed", addressOrENSName],
    queryFn: async () => {
      const response = await fetch(`/api/embeds/delegate/${addressOrENSName}`);
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json() as Promise<DelegateEmbedData>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="my-3 border border-line rounded-xl p-4 animate-pulse bg-tertiary/10 shadow-newDefault">
        <div className="flex items-center gap-3 mb-3">
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
    return null; // Fail silently, keep the original link
  }

  const totalVotes =
    (data.voteStats?.forVotes || 0) +
    (data.voteStats?.againstVotes || 0) +
    (data.voteStats?.abstainVotes || 0);

  return (
    <Link
      href={data.url}
      className="block my-3 !no-underline !decoration-none hover:!no-underline prose-a:!no-underline group"
    >
      <div className="border border-line rounded-xl p-4 bg-cardBackground shadow-newDefault hover:shadow-newHover transition-shadow [&_*]:!no-underline [&_*]:!decoration-none">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <ENSAvatar
              ensName={data.displayName}
              size={48}
              className="w-12 h-12"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-primary mb-2.5 group-hover:opacity-80 transition-opacity mt-0">
              <ENSName address={data.address} />
            </h3>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-secondary">Voting Power</span>
                <span className="text-primary font-semibold">
                  {data.votingPower}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-secondary">Delegators</span>
                <span className="text-primary font-semibold">
                  {data.delegatorsCount}
                </span>
              </div>
              {data.proposalsCreated > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-secondary">Proposals</span>
                  <span className="text-primary font-semibold">
                    {data.proposalsCreated}
                  </span>
                </div>
              )}
              {totalVotes > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-secondary">Votes Cast</span>
                  <span className="text-primary font-semibold">
                    {totalVotes}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
