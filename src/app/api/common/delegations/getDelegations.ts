import { type Delegation } from "./delegation";
import { getHumanBlockTime } from "@/lib/blockTimes";
import { cache } from "react";
import { prismaWeb2Client } from "@/app/lib/prisma";
import { getProxyAddress } from "@/lib/alligatorUtils";
import { addressOrEnsNameWrap } from "../utils/ensName";
import Tenant from "@/lib/tenant/tenant";
import {
  PaginatedResult,
  paginateResult,
  PaginationParams,
} from "@/app/lib/pagination";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { Prisma } from "@prisma/client";
import { findAdvancedDelegatee, findDelagatee } from "@/lib/prismaUtils";
import { DELEGATION_MODEL } from "@/lib/constants";
import { withMetrics } from "@/lib/metricWrapper";
import { getDelegateDataFromDaoNode } from "@/app/lib/dao-node/client";

/**
 * Delegations for a given address (addresses the given address is delegating to)
 * @param addressOrENSName
 */
const getCurrentDelegatees = (addressOrENSName: string) =>
  addressOrEnsNameWrap(getCurrentDelegateesForAddress, addressOrENSName);

async function getCurrentDelegateesForAddress({
  address,
}: {
  address: string;
}): Promise<Delegation[]> {
  return withMetrics("getCurrentDelegateesForAddress", async () => {
    const { namespace, contracts, ui } = Tenant.current();

    const getDirectDelegatee = async () => {
      const delegatee = await findDelagatee({
        namespace,
        address,
        contract: contracts.token.address,
      });

      if (namespace === TENANT_NAMESPACES.OPTIMISM) {
        const proxyAddress = await getProxyAddress(address);
        if (delegatee?.delegatee === proxyAddress?.toLowerCase()) {
          return null;
        }
      }
      return delegatee;
    };

    let advancedDelegatees;
    let directDelegatee;

    // Should be if governor == Agora 1.0 w/ Partial Delegation On
    if (contracts.delegationModel === DELEGATION_MODEL.PARTIAL) {
      advancedDelegatees = await findAdvancedDelegatee({
        namespace,
        address,
        contract: contracts.token.address,
      });
      directDelegatee = null;
    } else {
      [advancedDelegatees, directDelegatee] = await Promise.all([
        findAdvancedDelegatee({
          namespace,
          address,
          contract: contracts.alligator?.address || contracts.token.address,
        }),
        getDirectDelegatee(),
      ]);
    }

    const latestBlock = await contracts.token.provider.getBlock("latest");

    const advancedDelegateesDataPromises = advancedDelegatees.map(
      async (advancedDelegatee) => {
        return {
          from: advancedDelegatee.from,
          to: advancedDelegatee.to,
          allowance: advancedDelegatee.delegated_amount.toFixed(0),
          percentage: advancedDelegatee.delegated_share.toString(),
          timestamp: latestBlock
            ? getHumanBlockTime(
                advancedDelegatee.block_number,
                latestBlock,
                true
              )
            : null,
          type: "ADVANCED" as const,
          amount:
            Number(advancedDelegatee.delegated_share.toFixed(3)) === 1
              ? ("FULL" as const)
              : ("PARTIAL" as const),
          transaction_hash: advancedDelegatee.transaction_hash || "",
        };
      }
    );

    const advancedDelegateesData = await Promise.all(
      advancedDelegateesDataPromises
    );

    const directDelegateeData = directDelegatee && {
      from: directDelegatee.delegator,
      to: directDelegatee.delegatee,
      allowance: directDelegatee.balance.toFixed(),
      percentage: "0", // Only used in Agora token partial delegation
      timestamp: latestBlock
        ? getHumanBlockTime(
            directDelegatee.block_number as bigint,
            latestBlock,
            true
          )
        : null,
      type: "DIRECT" as const,
      amount: "FULL" as const,
      transaction_hash: directDelegatee.transaction_hash || "",
    };

    return directDelegateeData
      ? [directDelegateeData, ...advancedDelegateesData]
      : advancedDelegateesData;
  });
}

/**
 * Delegators for a given address (addresses delegating to the given address)
 * @param addressOrENSName
 * @param pagination
 */
const getCurrentDelegators = (
  addressOrENSName: string,
  pagination?: { offset: number; limit: number }
) =>
  addressOrEnsNameWrap(getCurrentDelegatorsForAddress, addressOrENSName, {
    pagination,
  });

async function getCurrentDelegatorsForAddress({
  address,
  pagination = {
    offset: 0,
    limit: 20,
  },
}: {
  address: string;
  pagination?: PaginationParams;
}): Promise<PaginatedResult<Delegation[]>> {
  return withMetrics("getCurrentDelegatorsForAddress", async () => {
    const { namespace, contracts } = Tenant.current();

    // -----------------------------------------------------------------------
    // DAO Node path: use DAO Node delegators if available
    // -----------------------------------------------------------------------
    const daoNodeData = await getDelegateDataFromDaoNode(address);
    const daoDelegate = daoNodeData?.delegate;

    if (daoDelegate?.from_list && Array.isArray(daoDelegate.from_list)) {
      let balanceFilter = BigInt(0);
      if (contracts.token.isERC20()) {
        balanceFilter = BigInt(1e15);
      } else if (contracts.token.isERC721()) {
        balanceFilter = BigInt(0);
      } else {
        throw new Error(
          "Token is neither ERC20 nor ERC721, therefore unsupported."
        );
      }

      const latestBlock =
        daoDelegate.from_list.length > 0
          ? await contracts.token.provider.getBlock("latest")
          : null;

      const mapped = daoDelegate.from_list.map((delegator: any) => {
        const bn = delegator.bn ?? delegator.block_number;
        const pct = delegator.percentage;
        const balance = BigInt(delegator.balance ?? 0);
        const isFull =
          pct === 10000 || pct === undefined || pct === null || pct === 0;
        const allowance = isFull
          ? balance
          : pct !== undefined && pct !== null
            ? (balance * BigInt(pct)) / BigInt(10000)
            : balance;

        const timestamp =
          latestBlock && bn
            ? getHumanBlockTime(BigInt(bn), latestBlock, true)
            : null;

        return {
          from: (delegator.delegator || delegator.from || "").toLowerCase(),
          to: address,
          allowance: allowance.toString(),
          percentage: pct !== undefined && pct !== null ? String(pct) : "0",
          timestamp,
          type: "DIRECT" as const,
          amount: isFull ? ("FULL" as const) : ("PARTIAL" as const),
          transaction_hash:
            delegator.txhash || delegator.transaction_hash || "",
        };
      });

      const filtered = mapped.filter(
        (delegator) => BigInt(delegator.allowance) > balanceFilter
      );

      const totalCount =
        typeof daoDelegate.from_cnt === "number"
          ? daoDelegate.from_cnt
          : filtered.length;

      const sliced = filtered.slice(
        pagination.offset,
        pagination.offset + pagination.limit
      );
      const hasNext = pagination.offset + pagination.limit < filtered.length;

      return {
        meta: {
          has_next: hasNext,
          next_offset: pagination.offset + pagination.limit,
          total_returned: sliced.length,
          total_count: totalCount,
        },
        data: sliced,
      };
    }

    let advancedDelegatorsSubQry: string;
    let directDelegatorsSubQry: string;
    let contractAddress = contracts.alligator
      ? contracts.alligator.address
      : contracts.token.address;

    // Replace with the Agora Governor flag
    if (
      contracts.alligator ||
      contracts.delegationModel === DELEGATION_MODEL.PARTIAL
    ) {
      advancedDelegatorsSubQry = `SELECT
                                    "from",
                                    "to",
                                    delegated_amount as allowance,
                                    'ADVANCED' AS type,
                                    block_number,
                                    CASE WHEN delegated_share >= 1 THEN 'FULL' ELSE 'PARTIAL' END as amount,
                                    transaction_hash
                                  FROM
                                    ${namespace}.advanced_delegatees ad
                                  WHERE
                                    ad."to" = $1
                                    AND delegated_amount > 0
                                    AND contract = $2`;
    } else {
      advancedDelegatorsSubQry = `WITH ghost as (SELECT
                                    null::text as "from",
                                    null::text as "to",
                                    null::numeric as allowance,
                                    'ADVANCED' AS type,
                                    null::numeric as block_number,
                                    'FULL' as amount,
                                    null::text as transaction_hash)
                                    select * from ghost
                                  WHERE
                                    ghost."to" = $1
                                    AND ghost."from" = $2`;
    }

    if (namespace === TENANT_NAMESPACES.OPTIMISM) {
      // This case is actually, just any tenant that has a delegatees_mat view working and compatible.
      directDelegatorsSubQry = `  SELECT
                                    "from",
                                    "to",
                                    NULL::numeric AS allowance,
                                    'DIRECT' AS type,
                                    block_number,
                                    'FULL' AS amount,
                                    transaction_hash
                                  FROM
                                    ${namespace}.delegatees_mat
                                  WHERE
                                      address = $3 AND
                                      "to" = $1
                                  ORDER BY
                                    block_number DESC`;
    } else if (contracts.delegationModel === DELEGATION_MODEL.PARTIAL) {
      directDelegatorsSubQry = `WITH ghost as (SELECT
                  null::text as "from",
                  null::text as "to",
                  null::numeric as allowance,
                  'DIRECT' AS type,
                  null::numeric as block_number,
                  'FULL' as amount,
                  null::text as transaction_hash)
                  select * from ghost
                WHERE
                  ghost."to" = $3
                  AND ghost."from" = $3`;
    } else if (contracts.token.isERC721()) {
      directDelegatorsSubQry = `
              with latest_delegations AS (
                                              SELECT DISTINCT ON (delegator) 
                                                  delegator,
                                                  to_delegate,
                                                  chain_id,
                                                  address,
                                                  block_number,
                                                  transaction_index,
                                                  log_index,
                                                  transaction_hash
                                              FROM
                                                  ${namespace}.delegate_changed_events WHERE address = $3
                                              ORDER BY
                                                  delegator,
                                                  block_number DESC,
                                                  transaction_index DESC,
                                                  log_index DESC)
    
                                              SELECT delegator as "from",
                                                     to_delegate as "to",
                                                     null::numeric as allowance,
                                                     'DIRECT' as type,
                                                     block_number,
                                                     'FULL' as amount,
                                                     transaction_hash from latest_delegations where LOWER(to_delegate) = LOWER($1)`;
    } else {
      directDelegatorsSubQry = `
              SELECT
                "from",
                "to",
                null::numeric as allowance,
                'DIRECT' as type,
                block_number,
                'FULL' as amount,
                transaction_hash
              FROM (
                SELECT
                  delegator AS "from",
                  to_delegate AS "to",
                  block_number,
                  transaction_hash,
                  log_index,
                  transaction_index,
                  address
                FROM
                  ${namespace}.delegate_changed_events
                WHERE
                  to_delegate = $1 AND address = $3
                ORDER BY
                  block_number DESC,
                  log_index DESC,
                  transaction_index DESC
              ) t1
              WHERE NOT EXISTS (
                  SELECT
                    1
                  FROM
                    ${namespace}.delegate_changed_events t2
                  WHERE
                    t2."delegator" = t1."from" AND t2.address = t1.address
                    AND (t2.block_number > t1.block_number
                    OR (t2.block_number = t1.block_number AND t2.log_index > t1.log_index) OR (t2.block_number = t1.block_number AND t2.log_index = t1.log_index AND t2.transaction_index > t1.transaction_index)))
              ORDER BY
                block_number DESC,
                log_index DESC,
                transaction_index DESC`;
    }

    const delegatorsQry = `
        WITH advanced_delegatees AS ( ${advancedDelegatorsSubQry} ),
             direct_delegatees AS ( ${directDelegatorsSubQry} )
        SELECT * FROM advanced_delegatees
        UNION ALL
        SELECT * FROM direct_delegatees
        OFFSET $4
        LIMIT $5;
      `;

    const [delegators, latestBlock] = await Promise.all([
      paginateResult(async (skip: number, take: number) => {
        return prismaWeb2Client.$queryRawUnsafe<
          {
            from: string;
            to: string;
            allowance: Prisma.Decimal;
            type: "DIRECT" | "ADVANCED";
            block_number: bigint;
            amount: "FULL" | "PARTIAL";
            transaction_hash: string;
          }[]
        >(
          delegatorsQry,
          address,
          contractAddress,
          contracts.token.address,
          skip,
          take
        );
      }, pagination),
      contracts.token.provider.getBlock("latest"),
    ]);

    const delagtorsData = await Promise.all(
      delegators.data.map(async (delegator) => ({
        from: delegator.from,
        to: delegator.to,
        allowance:
          delegator.type === "ADVANCED"
            ? delegator.allowance.toFixed(0)
            : (
                await contracts.token.contract.balanceOf(delegator.from)
              ).toString(),
        percentage: "0", // Only used in Agora token partial delegation
        timestamp: latestBlock
          ? getHumanBlockTime(delegator.block_number, latestBlock, true)
          : null,
        type: delegator.type,
        amount: delegator.amount,
        transaction_hash: delegator.transaction_hash,
      }))
    );

    var balanceFilter = BigInt(0);

    if (contracts.token.isERC20()) {
      balanceFilter = BigInt(1e15);
    } else if (contracts.token.isERC721()) {
      balanceFilter = BigInt(0);
    } else {
      throw new Error(
        "Token is neither ERC20 nor ERC721, therefore unsupported."
      );
    }

    const filteredDelegatorsData = delagtorsData.filter(
      (delegator) => BigInt(delegator.allowance) > balanceFilter // filter out delegators with 0 (or close to 0) balance
    );

    return {
      meta: {
        ...delegators.meta,
        total_returned: filteredDelegatorsData.length,
      },
      data: filteredDelegatorsData,
    };
  });
}

/**
 * Advanced delegators for a given address (addresses delegating to the given address)
 * @param addressOrENSName
 */

const getCurrentAdvancedDelegators = (addressOrENSName: string) =>
  addressOrEnsNameWrap(
    getCurrentAdvancedDelegatorsForAddress,
    addressOrENSName
  );

async function getCurrentAdvancedDelegatorsForAddress({
  address,
}: {
  address: string;
}): Promise<Delegation[]> {
  return withMetrics("getCurrentAdvancedDelegatorsForAddress", async () => {
    const { namespace, contracts } = Tenant.current();

    const [advancedDelegators, latestBlock] = await Promise.all([
      findAdvancedDelegatee({
        namespace,
        address,
        contract: contracts.alligator?.address || contracts.token.address,
      }),
      contracts.token.provider.getBlock("latest"),
    ]);

    const advancedDelegatorsDataPromises = advancedDelegators.map(
      async (advancedDelegator) => {
        return {
          from: advancedDelegator.from,
          to: advancedDelegator.to,
          allowance: advancedDelegator.delegated_amount.toFixed(0),
          percentage: "0", // Only used in Agora token partial delegation
          timestamp: latestBlock
            ? getHumanBlockTime(
                advancedDelegator.block_number,
                latestBlock,
                true
              )
            : null,
          type: "ADVANCED" as const,
          amount:
            Number(advancedDelegator.delegated_share.toFixed(3)) === 1
              ? ("FULL" as const)
              : ("PARTIAL" as const),
          transaction_hash: advancedDelegator.transaction_hash || "",
        };
      }
    );

    const advancedDelegatorsData = await Promise.all(
      advancedDelegatorsDataPromises
    );

    return advancedDelegatorsData;
  });
}

/**
 * Get the direct delegatee for a given address
 * @param addressOrENSName
 */
const getDirectDelegatee = (addressOrENSName: string) =>
  addressOrEnsNameWrap(getDirectDelegateeForAddress, addressOrENSName);

const getDirectDelegateeForAddress = async ({
  address,
}: {
  address: string;
}) => {
  return withMetrics("getDirectDelegateeForAddress", async () => {
    const { namespace, contracts } = Tenant.current();

    const delegatee = await findDelagatee({
      namespace,
      address,
      contract: contracts.token.address.toLowerCase(),
    });

    if (namespace === TENANT_NAMESPACES.OPTIMISM) {
      const proxyAddress = await getProxyAddress(address);
      if (delegatee?.delegatee === proxyAddress?.toLowerCase()) {
        return null;
      }
    }
    return delegatee;
  });
};

/**
 * Get all addresses that are in the delegation chain for a given address
 * @param addressOrENSName
 */
const getAllDelegatorsInChains = (addressOrENSName: string) =>
  addressOrEnsNameWrap(getAllDelegatorsInChainsForAddress, addressOrENSName);

async function getAllDelegatorsInChainsForAddress({
  address,
}: {
  address: string;
}) {
  return withMetrics("getAllDelegatorsInChainsForAddress", async () => {
    const { namespace, contracts } = Tenant.current();

    if (!contracts.alligator) {
      return [];
    }

    const allAddresess = await prismaWeb2Client.$queryRawUnsafe<
      { addresses: string[] }[]
    >(
      `
        SELECT array_agg(DISTINCT u.element) AS addresses
        FROM ${namespace + ".authority_chains"}, unnest(chain) as u(element)
        WHERE delegate=$1 AND contract=$2 AND allowance > 0;
        `,
      address,
      contracts.alligator?.address
    );

    return allAddresess[0].addresses;
  });
}

export const fetchCurrentDelegatees = cache(getCurrentDelegatees);
export const fetchCurrentDelegators = cache(getCurrentDelegators);
export const fetchDirectDelegatee = cache(getDirectDelegatee);
export const fetchAllDelegatorsInChains = cache(getAllDelegatorsInChains);
export const fetchCurrentAdvancedDelegators = cache(
  getCurrentAdvancedDelegators
);
