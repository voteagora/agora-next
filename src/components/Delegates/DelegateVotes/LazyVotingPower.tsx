"use client";

import { useQuery } from "@tanstack/react-query";
import { pluralizeVote } from "@/lib/tokenUtils";

export default function LazyVotingPower({
  address,
  blockNumber,
  baseWeight,
}: {
  address: string;
  blockNumber: number;
  baseWeight: string;
}) {
  const { data: additionalVp, isLoading } = useQuery({
    queryKey: ["nonivotes-vp", address, blockNumber],
    queryFn: async () => {
      const response = await fetch(
        `/api/dao-node/nonivotes/${address}/${blockNumber}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch voting power");
      }
      const data = await response.json();
      return data.vp || "0";
    },
    staleTime: Infinity,
    retry: 1,
  });

  if (isLoading) {
    return (
      <span className="opacity-50">{pluralizeVote(BigInt(baseWeight))}</span>
    );
  }

  const total = BigInt(baseWeight) + BigInt(additionalVp || "0");
  return <span>{pluralizeVote(total)}</span>;
}
