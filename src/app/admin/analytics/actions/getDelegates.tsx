"use server";

import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { analyticsStartingBlockNumber } from "../utils";
import { ANALYTICS_EVENTS } from "@/lib/constants";
import { getSecondsPerBlock } from "@/lib/blockTimes";

// Range: how many blocks from the previous block should we check for events
// Interval: how many blocks should be inclucded in each traunch
export const getDelegates = async ({
  range = 60 * 60 * 24,
  interval = 60 * 60 * 24,
}: {
  range: number;
  interval: number;
}) => {
  const { contracts, slug, namespace } = Tenant.current();
  const chainId = contracts.token.chain.id;

  const secondsPerBlock = getSecondsPerBlock();
  const rangeInBlocks = Math.floor(range / secondsPerBlock);
  const intervalInBlocks = Math.floor(interval / secondsPerBlock);
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

  const eventsStartedAtBlock =
    analyticsStartingBlockNumber[
      chainId as keyof typeof analyticsStartingBlockNumber
    ];

  const delegatesQuery = `
    SELECT d.transaction_hash, d.block_number
    FROM ${namespace}.delegate_changed_events d
    WHERE CAST(d.block_number AS INTEGER) >= ${eventsStartedAtBlock}
    AND d.block_number >= ${currentBlockNumber - range}
    AND d.address = '${contracts.token.address.toLowerCase()}'
    GROUP BY d.transaction_hash, d.block_number
    ORDER BY d.block_number ASC
  `;

  const delegateAnalyticsEvents = (await prisma.$queryRawUnsafe(
    eventsQuery
  )) as {
    transaction_hash: string;
  }[];

  const delegateOnChainEvents = (await prisma.$queryRawUnsafe(
    delegatesQuery
  )) as {
    transaction_hash: string;
    block_number: number;
  }[];

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
