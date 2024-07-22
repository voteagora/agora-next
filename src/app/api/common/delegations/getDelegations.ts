import { type Delegation } from "./delegation";
import { getHumanBlockTime } from "@/lib/blockTimes";
import { cache } from "react";
import prisma from "@/app/lib/prisma";
import { getProxyAddress } from "@/lib/alligatorUtils";
import { addressOrEnsNameWrap } from "../utils/ensName";
import Tenant from "@/lib/tenant/tenant";
import { PaginatedResult, paginateResult } from "@/app/lib/pagination";
import { TENANT_NAMESPACES } from "@/lib/constants";

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
    const delegatee = await prisma[`${namespace}Delegatees`].findFirst({
      where: { delegator: address.toLowerCase() },
    });

    if (namespace === TENANT_NAMESPACES.OPTIMISM) {
      const proxyAddress = await getProxyAddress(address);
      if (delegatee?.delegatee === proxyAddress?.toLowerCase()) {
        return null;
      }
    }
    return delegatee;
  };

  const [advancedDelegatees, directDelegatee] = await Promise.all([
    prisma[`${namespace}AdvancedDelegatees`].findMany({
      where: {
        from: address.toLowerCase(),
        delegated_amount: { gt: 0 },
        contract: contracts.alligator?.address,
      },
    }),
    getDirectDelegatee(),
  ]);

  const latestBlock = await contracts.token.provider.getBlock("latest");

  const advancedDelegateesData = advancedDelegatees.map(
    (advancedDelegatee) => ({
      from: advancedDelegatee.from,
      to: advancedDelegatee.to,
      allowance: advancedDelegatee.delegated_amount.toFixed(0),
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
 */
const getCurrentDelegators = (addressOrENSName: string, page?: number) =>
  addressOrEnsNameWrap(getCurrentDelegatorsForAddress, addressOrENSName, {
    page,
  });

async function getCurrentDelegatorsForAddress({
  address,
  page = 1,
}: {
  address: string;
  page?: number;
}): Promise<PaginatedResult<Delegation[]>> {
  const { namespace, contracts } = Tenant.current();
  const pageSize = 20;

  const [advancedDelegators, directDelegators, latestBlock] = await Promise.all(
    [
      (() =>
        page == 1
          ? prisma[`${namespace}AdvancedDelegatees`].findMany({
              where: {
                to: address.toLowerCase(),
                delegated_amount: { gt: 0 },
                contract: contracts.alligator?.address,
              },
            })
          : [])(),
      (async () => {
        return paginateResult(
          async (skip: number, take: number) => {
            return prisma.$queryRawUnsafe<
              {
                delegator: string;
                delegatee: string;
                block_number: bigint;
                transaction_hash: string;
              }[]
            >(
              `
            SELECT *
            FROM (
              SELECT
                delegator,
                to_delegate AS delegatee,
                block_number,
                transaction_hash,
                log_index,
                transaction_index,
                address
              FROM
                ${namespace}.delegate_changed_events
              WHERE
                to_delegate = $1 AND address = $2
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
                  t2.delegator = t1.delegator AND t2.address = t1.address
                  AND (t2.block_number > t1.block_number
                  OR (t2.block_number = t1.block_number AND t2.log_index > t1.log_index) OR (t2.block_number = t1.block_number AND t2.log_index = t1.log_index AND t2.transaction_index > t1.transaction_index)))
            ORDER BY
              block_number DESC,
              log_index DESC,
              transaction_index DESC
            OFFSET $3
            LIMIT $4;
            `,
              address,
              contracts.token.address.toLowerCase(),
              skip,
              take
            );
          },
          page,
          pageSize
        );
      })(),
      contracts.token.provider.getBlock("latest"),
    ]
  );

  const advancedDelegatorsData = advancedDelegators.map(
    (advancedDelegator) => ({
      from: advancedDelegator.from,
      to: advancedDelegator.to,
      allowance: advancedDelegator.delegated_amount.toFixed(0),
      timestamp: latestBlock
        ? getHumanBlockTime(advancedDelegator.block_number, latestBlock)
        : null,
      type: "ADVANCED" as const,
      amount:
        Number(advancedDelegator.delegated_share.toFixed(3)) === 1
          ? ("FULL" as const)
          : ("PARTIAL" as const),
      transaction_hash: advancedDelegator.transaction_hash || "",
    })
  );

  const directDelegatorsData = await Promise.all(
    directDelegators.data.map(async (directDelegator) => ({
      from: directDelegator.delegator,
      to: directDelegator.delegatee,
      allowance: (
        await contracts.token.contract.balanceOf(directDelegator.delegator)
      ).toString(),
      timestamp: latestBlock
        ? getHumanBlockTime(directDelegator.block_number, latestBlock)
        : null,
      type: "DIRECT" as const,
      amount: "FULL" as const,
      transaction_hash: directDelegator.transaction_hash,
    }))
  );

  const filteredDirectDelegatorsData = directDelegatorsData.filter(
    (delegator) => BigInt(delegator.allowance) > BigInt(1e15) // filter out delegators with 0 (or close to 0) balance
  );

  return {
    meta: directDelegators.meta,
    data: [...advancedDelegatorsData, ...filteredDirectDelegatorsData],
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

async function getCurrentAdvancedDelegatorsForAddress(
  address: string
): Promise<Delegation[]> {
  const { namespace, contracts } = Tenant.current();

  const [advancedDelegators, latestBlock] = await Promise.all([
    prisma[`${namespace}AdvancedDelegatees`].findMany({
      where: {
        to: address.toLowerCase(),
        delegated_amount: { gt: 0 },
        contract: contracts.alligator?.address,
      },
    }),
    contracts.token.provider.getBlock("latest"),
  ]);

  return advancedDelegators.map((advancedDelegator) => ({
    from: advancedDelegator.from,
    to: advancedDelegator.to,
    allowance: advancedDelegator.delegated_amount.toFixed(0),
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
  const { namespace } = Tenant.current();

  const delegatee = await prisma[`${namespace}Delegatees`].findFirst({
    where: { delegator: address.toLowerCase() },
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
