import { type Delegation } from "./delegation";
import { getHumanBlockTime } from "@/lib/blockTimes";
import { cache } from "react";
import prisma from "@/app/lib/prisma";
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
  const { namespace, contracts } = Tenant.current();

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
  if (namespace === TENANT_NAMESPACES.SCROLL) {
    advancedDelegatees = await findAdvancedDelegatee({
      namespace,
      address,
      contract: contracts.token.address,
      partial: true,
    });
    directDelegatee = null;
  } else {
    [advancedDelegatees, directDelegatee] = await Promise.all([
      findAdvancedDelegatee({
        namespace,
        address,
        contract: contracts.token.address,
      }),
      getDirectDelegatee(),
    ]);
  }

  const latestBlock = await contracts.token.provider.getBlock("latest");

  const advancedDelegateesData = advancedDelegatees.map(
    (advancedDelegatee) => ({
      from: advancedDelegatee.from,
      to: advancedDelegatee.to,
      allowance: advancedDelegatee.delegated_amount.toFixed(0),
      percentage: advancedDelegatee.delegated_share.toString(),
      timestamp: latestBlock
        ? getHumanBlockTime(advancedDelegatee.block_number, latestBlock)
        : null,
      type: "ADVANCED" as const,
      amount:
        Number(advancedDelegatee.delegated_share.toFixed(3)) === 1
          ? ("FULL" as const)
          : ("PARTIAL" as const),
      transaction_hash: advancedDelegatee.transaction_hash || "",
    })
  );

  const directDelegateeData = directDelegatee && {
    from: directDelegatee.delegator,
    to: directDelegatee.delegatee,
    allowance: directDelegatee.balance.toFixed(),
    percentage: "0", // Only used in Agora token partial delegation
    timestamp: latestBlock
      ? getHumanBlockTime(directDelegatee.block_number, latestBlock)
      : null,
    type: "DIRECT" as const,
    amount: "FULL" as const,
    transaction_hash: directDelegatee.transaction_hash || "",
  };

  return directDelegateeData
    ? [directDelegateeData, ...advancedDelegateesData]
    : advancedDelegateesData;
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
  const { namespace, contracts } = Tenant.current();

  let advancedDelegatorsSubQry: string;
  let directDelegatorsSubQry: string;
  let contractAddress = contracts.alligator
    ? contracts.alligator.address
    : contracts.token.address;

  // Replace with the Agora Governor flag
  if (contracts.alligator || namespace === TENANT_NAMESPACES.SCROLL) {
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

  if (namespace == TENANT_NAMESPACES.SCROLL) {
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

  const [delegators, latestBlock] = await Promise.all([
    paginateResult(async (skip: number, take: number) => {
      return prisma.$queryRawUnsafe<
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
        `
        WITH advanced_delegatees AS ( ${advancedDelegatorsSubQry} )

        , direct_delegatees AS ( ${directDelegatorsSubQry} )
        SELECT * FROM advanced_delegatees
        UNION ALL
        SELECT * FROM direct_delegatees
        OFFSET $4
        LIMIT $5;
      `,
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
        ? getHumanBlockTime(delegator.block_number, latestBlock)
        : null,
      type: delegator.type,
      amount: delegator.amount,
      transaction_hash: delegator.transaction_hash,
    }))
  );

  const filteredDelegatorsData = delagtorsData.filter(
    (delegator) => BigInt(delegator.allowance) > BigInt(1e15) // filter out delegators with 0 (or close to 0) balance
  );

  return {
    meta: { ...delegators.meta, total_returned: filteredDelegatorsData.length },
    data: filteredDelegatorsData,
  };
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
  const { namespace, contracts } = Tenant.current();

  const [advancedDelegators, latestBlock] = await Promise.all([
    findAdvancedDelegatee({
      namespace,
      address,
      contract: contracts.alligator?.address,
    }),
    contracts.token.provider.getBlock("latest"),
  ]);

  return advancedDelegators.map((advancedDelegator) => ({
    from: advancedDelegator.from,
    to: advancedDelegator.to,
    allowance: advancedDelegator.delegated_amount.toFixed(0),
    percentage: "0", // Only used in Agora token partial delegation
    timestamp: latestBlock
      ? getHumanBlockTime(advancedDelegator.block_number, latestBlock)
      : null,
    type: "ADVANCED",
    amount:
      Number(advancedDelegator.delegated_share.toFixed(3)) === 1
        ? "FULL"
        : "PARTIAL",
    transaction_hash: advancedDelegator.transaction_hash || "",
  }));
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
  const { namespace, contracts } = Tenant.current();
  const allAddresess = await prisma.$queryRawUnsafe<{ addresses: string[] }[]>(
    `
    SELECT array_agg(DISTINCT u.element) AS addresses
    FROM ${namespace + ".authority_chains"}, unnest(chain) as u(element)
    WHERE delegate=$1 AND contract=$2 AND allowance > 0;
    `,
    address,
    contracts.alligator?.address
  );

  return allAddresess[0].addresses;
}

export const fetchCurrentDelegatees = cache(getCurrentDelegatees);
export const fetchCurrentDelegators = cache(getCurrentDelegators);
export const fetchDirectDelegatee = cache(getDirectDelegatee);
export const fetchAllDelegatorsInChains = cache(getAllDelegatorsInChains);
export const fetchCurrentAdvancedDelegators = cache(
  getCurrentAdvancedDelegators
);
