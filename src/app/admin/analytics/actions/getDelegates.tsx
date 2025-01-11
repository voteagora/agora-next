"use server";

import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { ANALYTICS_EVENTS } from "@/lib/constants";
import { getSecondsPerBlock } from "@/lib/blockTimes";

// Range: how many blocks from the previous block should we check for events
// Num of intervals: how many traunches should be made
export const getDelegates = async ({
  interval = 60 * 60 * 24,
  numOfIntervals = 5,
}: {
  interval: number;
  numOfIntervals: number;
}) => {
  const { contracts, slug, namespace } = Tenant.current();
  const chainId = contracts.token.chain.id;

  const secondsPerBlock = getSecondsPerBlock();
  const intervalInBlocks = Math.floor(interval / secondsPerBlock);
  const rangeInBlocks = intervalInBlocks * numOfIntervals;
  const currentBlockNumber = await contracts.token.provider.getBlockNumber();

  const eventsQuery = `
    SELECT
    event_data->>'transaction_hash' as transaction_hash
    FROM alltenant.analytics_events
    WHERE event_name = '${ANALYTICS_EVENTS.DELEGATE}'
    AND event_data->>'dao_slug' = '${slug}'
    AND event_data->>'contract_address' = '${contracts.token.address.toLowerCase()}'
    GROUP BY event_data->>'transaction_hash'
  `;

  const delegatesQuery = `
    SELECT d.transaction_hash, d.block_number
    FROM ${namespace}.delegate_changed_events d
    WHERE CAST(d.block_number AS INTEGER) >= ${currentBlockNumber - rangeInBlocks}
    AND d.address = '${contracts.token.address.toLowerCase()}'
    GROUP BY d.transaction_hash, d.block_number
    ORDER BY d.block_number ASC
  `;

  const start = performance.now();

  const [delegateAnalyticsEvents, delegateOnChainEvents] = await Promise.all([
    prisma.$queryRawUnsafe(eventsQuery) as Promise<
      { transaction_hash: string }[]
    >,
    prisma.$queryRawUnsafe(delegatesQuery) as Promise<
      {
        transaction_hash: string;
        block_number: number;
      }[]
    >,
  ]);

  const end = performance.now();
  console.log(`Total query execution time: ${end - start} milliseconds`);

  let intervals = [];
  for (
    let startBlock = currentBlockNumber - rangeInBlocks;
    startBlock < currentBlockNumber;
    startBlock += intervalInBlocks
  ) {
    const endBlock = startBlock + intervalInBlocks;
    const eventsInBlockRange = delegateOnChainEvents.filter(
      (event) =>
        event.block_number >= startBlock && event.block_number <= endBlock
    );
    intervals.push({
      startBlock,
      endBlock,
      events: eventsInBlockRange,
    });
  }

  // for each group, check if the transaction hash is in the delegateAnalyticsEvents array
  // get count of matches for each group and return the total matches and total misses
  const matches = intervals.reduce(
    (acc, group) => {
      const matches = group.events.filter((event) =>
        delegateAnalyticsEvents.some(
          (e) => e.transaction_hash === event.transaction_hash
        )
      );
      acc.push({
        matches: matches.length,
        misses: group.events.length - matches.length,
        startBlock: group.startBlock,
        endBlock: group.endBlock,
      });

      return acc;
    },
    [] as {
      matches: number;
      misses: number;
      startBlock: number;
      endBlock: number;
    }[]
  );

  return matches;
};
