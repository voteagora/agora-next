"use client";

// TODO: check if this should be a singleton and mainnet, optimism
import { createPublicClient, http } from "viem";
import { optimism } from "viem/chains";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

export default function BlockDate({ blockNumber }: { blockNumber: bigint }) {
  const [timestamp, setTimestamp] = useState<string | null>(null);
  // Alchemy key
  const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID!;

  const publicClient = createPublicClient({
    chain: optimism,
    transport: http(`https://opt-mainnet.g.alchemy.com/v2/${alchemyId}`),
  });

  useEffect(() => {
    const getBlockTimestamp = async () => {
      const { timestamp } = await publicClient.getBlock({ blockNumber });
      const _timestamp = formatDistanceToNow(Number(timestamp) * 1000);
      setTimestamp(_timestamp);
    };
    getBlockTimestamp();
  }, [blockNumber, publicClient]);

  // TODO: loading
  return <span>{timestamp} ago</span>;
}
