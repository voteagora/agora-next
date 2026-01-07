import Tenant from "@/lib/tenant/tenant";
import {
  type PaginatedResult,
  type PaginationParams,
} from "@/app/lib/pagination";
import { DelegateChunk } from "../delegates/delegate";
import { doInSpan } from "@/app/lib/logging";
import { withMetrics } from "@/lib/metricWrapper";
import { unstable_cache } from "next/cache";
import { getDelegatesFromDaoNode } from "@/app/lib/dao-node/client";

const cachedGetDelegatesFromDaoNode = unstable_cache(
  (args: {
    sortBy?: string;
    reverse?: boolean;
    limit?: number;
    offset?: number;
    filters?: {
      delegator?: `0x${string}`;
    };
    withParticipation?: boolean;
  }) => {
    return getDelegatesFromDaoNode(args);
  },
  ["delegates-dao-node-badge"],
  {
    revalidate: 30,
    tags: ["delegates-dao-node-badge"],
  }
);

type DelegateData = {
  address: string;
  votingPower: { total: string; direct: string; advanced: string };
  statement: any;
  participation: number;
};

async function getBadgeHolders(
  badgeDefinitionId: string
): Promise<Set<string>> {
  const { namespace, contracts } = Tenant.current();
  const { prismaWeb3Client } = await import("@/app/lib/prisma");
  const daoId = contracts.easRecipient?.toLowerCase();
  const now = BigInt(Math.floor(Date.now() / 1000));

  const query = `
    SELECT DISTINCT ib."user" as address
    FROM ${namespace}.identity_badges ib
    WHERE ib.badge_definition_id = $1
      AND ib.dao_id = $2
      AND ib.revoked = false
      AND (ib.expiration_time = 0 OR ib.expiration_time > $3)
  `;

  const results = await prismaWeb3Client.$queryRawUnsafe<{ address: string }[]>(
    query,
    badgeDefinitionId,
    daoId,
    now
  );

  return new Set(results.map((row) => row.address.toLowerCase()));
}

function sanitizeStatement(statement: any) {
  if (
    statement?.payload &&
    typeof statement.payload === "object" &&
    "email" in statement.payload
  ) {
    const { email: _, ...payloadWithoutEmail } = statement.payload;
    return { ...statement, payload: payloadWithoutEmail };
  }
  return statement;
}

function normalizeDaoNodeDelegate(delegate: any): DelegateData {
  return {
    address: delegate.address?.toLowerCase() || "",
    votingPower: delegate.votingPower || {
      total: "0",
      direct: "0",
      advanced: "0",
    },
    statement: sanitizeStatement(delegate.statement),
    participation: delegate.participation ? delegate.participation * 100 : 0,
  };
}

export async function fetchDelegatesWithBadge({
  badgeDefinitionId,
  pagination = {
    limit: 500,
    offset: 0,
  },
}: {
  badgeDefinitionId: string;
  pagination?: PaginationParams;
}): Promise<PaginatedResult<DelegateChunk[]>> {
  return withMetrics("getDelegatesWithBadge", async () => {
    return await doInSpan({ name: "getDelegatesWithBadge" }, async () => {
      const badgeHolders = await getBadgeHolders(badgeDefinitionId);

      if (badgeHolders.size === 0) {
        return {
          meta: {
            has_next: false,
            next_offset: pagination.offset + pagination.limit,
            total_returned: 0,
            total_count: 0,
          },
          data: [],
        };
      }

      const daoNodeResult = await cachedGetDelegatesFromDaoNode({
        sortBy: "VP",
        reverse: true,
        limit: undefined,
        offset: undefined,
        withParticipation: false,
      });

      const daoNodeDelegateMap = new Map(
        daoNodeResult?.delegates?.map((d) => [
          d.address?.toLowerCase(),
          normalizeDaoNodeDelegate(d),
        ]) || []
      );

      const allDelegates = Array.from(badgeHolders).map((address) => {
        const daoNodeDelegate = daoNodeDelegateMap.get(address);
        if (daoNodeDelegate) {
          return daoNodeDelegate;
        }
        return {
          address,
          votingPower: {
            total: "0",
            direct: "0",
            advanced: "0",
          },
          statement: null,
          participation: 0,
        };
      });

      allDelegates.sort(() => Math.random() - 0.5);

      const paginatedDelegates = allDelegates.slice(
        pagination.offset,
        pagination.offset + pagination.limit
      );

      const result: DelegateChunk[] = paginatedDelegates.map((delegate) => ({
        address: delegate.address,
        votingPower: delegate.votingPower,
        statement: delegate.statement,
        participation: delegate.participation,
      }));

      return {
        meta: {
          has_next:
            pagination.offset + paginatedDelegates.length < allDelegates.length,
          next_offset: pagination.offset + pagination.limit,
          total_returned: paginatedDelegates.length,
          total_count: allDelegates.length,
        },
        data: result,
      };
    });
  });
}
