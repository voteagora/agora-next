"use server";

import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { ANALYTICS_EVENTS } from "@/lib/constants";
import { getSecondsPerBlock } from "@/lib/blockTimes";

export const getProposals = async ({
  range = 60 * 60 * 24,
  interval = 60 * 60 * 24,
}: {
  range: number;
  interval: number;
}) => {
  const { namespace, contracts, slug } = Tenant.current();
  const chainId = contracts.governor.chain.id;

  const secondsPerBlock = getSecondsPerBlock();
  const rangeInBlocks = Math.floor(range / secondsPerBlock);
  const intervalInBlocks = Math.floor(interval / secondsPerBlock);
  const currentBlockNumber = await contracts.token.provider.getBlockNumber();

  const eventsQuery = `
    SELECT
    event_data->>'transaction_hash' as transaction_hash
    FROM alltenant.analytics_events
    WHERE event_name = '${ANALYTICS_EVENTS.CREATE_PROPOSAL}'
    AND event_data->>'dao_slug' = '${slug}'
    AND event_data->>'governor_address' = '${contracts.governor.address.toLowerCase()}'
    GROUP BY event_data->>'transaction_hash'
  `;

  const proposalsQuery = `
    SELECT  p.end_block, p.description, p.created_transaction_hash
    FROM ${namespace}.proposals_v2 p
    WHERE CAST(p.start_block AS INTEGER) >= ${currentBlockNumber - rangeInBlocks}
    AND p.contract = '${contracts.governor.address.toLowerCase()}'
    GROUP BY p.end_block, p.description, p.created_transaction_hash
    ORDER BY p.end_block DESC;
  `;

  const start = performance.now();

  const [proposalAnalyticsEvents, proposalOnChainEvents] = await Promise.all([
    prisma.$queryRawUnsafe(eventsQuery) as Promise<
      {
        transaction_hash: string;
      }[]
    >,
    prisma.$queryRawUnsafe(proposalsQuery) as Promise<
      {
        end_block: number;
        description: string;
        created_transaction_hash: string;
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
    const eventsInBlockRange = proposalOnChainEvents.filter(
      (event) => event.end_block >= startBlock && event.end_block <= endBlock
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
        proposalAnalyticsEvents.some(
          (e) => e.transaction_hash === event.created_transaction_hash
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
