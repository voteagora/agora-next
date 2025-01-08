import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { analyticsStartingBlockNumber } from "../utils";
import { ANALYTICS_EVENTS } from "@/lib/constants";

export const getProposals = async () => {
  const { namespace, contracts, slug } = Tenant.current();
  const chainId = contracts.governor.chain.id;

  const eventsQuery = `
    SELECT
    event_data->>'transaction_hash' as transaction_hash
    FROM alltenant.analytics_events
    WHERE event_name = '${ANALYTICS_EVENTS.CREATE_PROPOSAL}'
    AND event_data->>'dao_slug' = '${slug}'
    AND event_data->>'contract_address' = '${contracts.governor.address.toLowerCase()}'
    GROUP BY event_data->>'transaction_hash'
  `;
  const eventsStartedAtBlock =
    analyticsStartingBlockNumber[
      chainId as keyof typeof analyticsStartingBlockNumber
    ];

  const proposalsQuery = `
    SELECT  p.end_block, p.description, p.created_transaction_hash
    FROM ${namespace}.proposals_v2 p
    WHERE CAST(p.start_block AS INTEGER) >= ${eventsStartedAtBlock}
    AND p.contract = '${contracts.governor.address.toLowerCase()}'
    GROUP BY p.end_block, p.description, p.created_transaction_hash
    ORDER BY p.end_block DESC;
  `;

  const proposalEvents = (await prisma.$queryRawUnsafe(eventsQuery)) as {
    transaction_hash: string;
  }[];

  const proposalTransactions = (await prisma.$queryRawUnsafe(
    proposalsQuery
  )) as {
    end_block: number;
    description: string;
    created_transaction_hash: string;
  }[];

  const proposalEventsGroups = proposalTransactions.reduce(
    (acc, event) => {
      const blockNumber = Number(event.end_block);
      const group = acc.find(
        (group) => Number(group[0].end_block) === Number(blockNumber - 1000)
      );
      if (group) {
        group.push(event);
      } else {
        acc.push([event]);
      }
      return acc;
    },
    [] as {
      end_block: number;
      description: string;
      created_transaction_hash: string;
    }[][]
  );

  // for each group, check if the transaction hash is in the delegateAnalyticsEvents array
  // get count of matches for each group and return the total matches and total misses
  const matches = proposalEventsGroups.reduce(
    (acc, group) => {
      const matches = group.filter((event) =>
        proposalEvents.some(
          (e) => e.transaction_hash === event.created_transaction_hash
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
