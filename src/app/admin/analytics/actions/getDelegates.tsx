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
    SELECT d.transaction_hash
    FROM ${namespace}.delegate_changed_events d
    WHERE CAST(d.block_number AS INTEGER) >= ${eventsStartedAtBlock}
    AND d.address = '${contracts.token.address.toLowerCase()}'
    GROUP BY d.transaction_hash
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
  }[];

  console.log("delegateOnChainEvents", delegateOnChainEvents);
  console.log("delegateAnalyticsEvents", delegateAnalyticsEvents);

  // possibly a slow query
  const numberOfMatches = delegateOnChainEvents.reduce((acc, event) => {
    const match = delegateAnalyticsEvents.find(
      (e) => e.transaction_hash === event.transaction_hash
    );
    if (match) {
      acc++;
    }
    return acc;
  }, 0);

  return {
    delegations_on_agora: numberOfMatches,
    delegations_elsewhere: delegateOnChainEvents.length - numberOfMatches,
  };
};
