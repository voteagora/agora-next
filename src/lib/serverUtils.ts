"use server";

import { unstable_cache } from "next/cache";
import { getPublicClient } from "./viem";

export const blockNumberAndTransactionIndexToHash = unstable_cache(
  async (blockNumber?: number, transactionIndex?: number) => {
    if (!blockNumber || !transactionIndex) {
      return null;
    }
    const publicClient = getPublicClient();
    const block = await publicClient.getBlock({
      blockNumber: BigInt(blockNumber),
    });
    return block.transactions[transactionIndex];
  },
  ["blockNumberAndTransactionIndexToHash"],
  {
    revalidate: 60 * 60 * 24 * 365, // 1 year cache
  }
);
