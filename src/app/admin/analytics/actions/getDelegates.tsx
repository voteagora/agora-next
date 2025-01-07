import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { startingBlockNumber } from "../utils";
import { ANALYTICS_EVENTS } from "@/lib/constants";

export const getDelegates = async () => {
  const { contracts, slug, namespace } = Tenant.current();
  const chainId = contracts.token.chain.id;

  const eventsQuery = `
    SELECT
    event_data->>'transaction_hash' as transaction_hash
    FROM alltenant.analytics_events
    WHERE event_name = '${ANALYTICS_EVENTS.DELEGATE}'
    AND event_data->>'dao_slug' = '${slug}'
    GROUP BY event_data->>'transaction_hash'
  `;

  const eventsStartedAtBlock =
    startingBlockNumber[chainId as keyof typeof startingBlockNumber];

  const delegatesQuery = `
    SELECT d.transaction_hash, d.block_number
    FROM ${namespace}.delegate_changed_events d
    WHERE CAST(d.block_number AS INTEGER) >= ${eventsStartedAtBlock}
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

  const delegateOnChainEventsGroups = delegateOnChainEvents.reduce(
    (acc, event) => {
      const blockNumber = Number(event.block_number);
      const group = acc.find(
        (group) => Number(group[0].block_number) === Number(blockNumber - 1000)
      );
      if (group) {
        group.push(event);
      } else {
        acc.push([event]);
      }
      return acc;
    },
    [] as { transaction_hash: string; block_number: number }[][]
  );

  // for each group, check if the transaction hash is in the delegateAnalyticsEvents array
  // get count of matches for each group and return the total matches and total misses
  const matches = delegateOnChainEventsGroups.reduce(
    (acc, group) => {
      const matches = group.filter((event) =>
        delegateAnalyticsEvents.some(
          (e) => e.transaction_hash === event.transaction_hash
        )
      );
      acc.push({
        matches: matches.length,
        misses: group.length - matches.length,
      });

      return acc;
    },
    [] as { matches: number; misses: number }[]
  );

  return matches;
};
