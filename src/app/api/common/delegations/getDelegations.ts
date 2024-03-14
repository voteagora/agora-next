import { Delegation } from "./delegation";
import { getHumanBlockTime } from "@/lib/blockTimes";
import prisma from "@/app/lib/prisma";
import provider from "@/app/lib/provider";
import { getProxyAddress } from "@/lib/alligatorUtils";
import { addressOrEnsNameWrap } from "../utils/ensName";
import Tenant from "@/lib/tenant/tenant";
import { paginatePrismaResult } from "@/app/lib/pagination";

/**
 * Delegations for a given address (addresses the given address is delegating to)
 * @param addressOrENSName
 */
export const getCurrentDelegatees = (addressOrENSName: string) =>
  addressOrEnsNameWrap(getCurrentDelegateesForAddress, addressOrENSName);

async function getCurrentDelegateesForAddress({
  address,
}: {
  address: string;
}): Promise<Delegation[]> {
  const { namespace, contracts } = Tenant.getInstance();

  const [advancedDelegatees, directDelegatee] = await Promise.all([
    prisma[`${namespace}AdvancedDelegatees`].findMany({
      where: {
        from: address.toLowerCase(),
        delegated_amount: { gt: 0 },
        contract: contracts.alligator!.address,
      },
    }),
    (async () => {
      const [proxyAddress, delegatee] = await Promise.all([
        getProxyAddress(address),
        prisma[`${namespace}Delegatees`].findFirst({
          where: { delegator: address.toLowerCase() },
        }),
      ]);

      if (
        proxyAddress &&
        delegatee &&
        delegatee.delegatee === proxyAddress.toLowerCase()
      ) {
        return null;
      }

      return delegatee;
    })(),
  ]);

  const latestBlock = await provider.getBlockNumber();

  return [
    ...(directDelegatee
      ? [
          {
            from: directDelegatee.delegator,
            to: directDelegatee.delegatee,
            allowance: directDelegatee.balance.toFixed(),
            timestamp: latestBlock
              ? getHumanBlockTime(directDelegatee.block_number, latestBlock)
              : null,
            type: "DIRECT",
            amount: "FULL",
          },
        ]
      : []),
    ...advancedDelegatees.map((advancedDelegatee) => ({
      from: advancedDelegatee.from,
      to: advancedDelegatee.to,
      allowance: advancedDelegatee.delegated_amount.toFixed(0),
      timestamp: latestBlock
        ? getHumanBlockTime(advancedDelegatee.block_number, latestBlock)
        : null,
      type: "ADVANCED",
      amount:
        Number(advancedDelegatee.delegated_share.toFixed(3)) >= 1
          ? "FULL"
          : "PARTIAL",
    })),
  ] as Delegation[];
}

/**
 * Delegators for a given address (addresses delegating to the given address)
 * @param addressOrENSName
 */
export const getCurrentDelegators = (addressOrENSName: string, page?: number) =>
  addressOrEnsNameWrap(getCurrentDelegatorsForAddress, addressOrENSName, {
    page,
  });

async function getCurrentDelegatorsForAddress({
  address,
  page = 1,
}: {
  address: string;
  page?: number;
}) {
  const { namespace, contracts } = Tenant.getInstance();
  const pageSize = 20;

  const [advancedDelegators, directDelegators] = await Promise.all([
    prisma[`${namespace}AdvancedDelegatees`].findMany({
      where: {
        to: address.toLowerCase(),
        delegated_amount: { gt: 0 },
        contract: contracts.alligator!.address,
      },
    }),
    (async () => {
      return paginatePrismaResult(
        async (skip: number, take: number) => {
          return prisma.$queryRawUnsafe<
            {
              delegator: string;
              delegatee: string;
              block_number: bigint;
            }[]
          >(
            `
            SELECT
              t1.delegator,
              t1.to_delegate AS delegatee,
              t1.block_number
            FROM
              center.optimism_delegate_changed_events t1
            WHERE
              t1.to_delegate = $1
              AND NOT EXISTS (
                SELECT
                  1
                FROM
                  center.optimism_delegate_changed_events t2
                WHERE
                  t2.delegator = t1.delegator
                  AND t2.block_number > t1.block_number
                  OR (t2.block_number = t1.block_number AND t2.log_index > t1.log_index) OR (t2.block_number = t1.block_number AND t2.log_index = t1.log_index AND t2.transaction_index > t1.transaction_index))
            ORDER BY
              t1.block_number DESC,
              t1.log_index DESC,
              t1.transaction_index DESC
            OFFSET $2
            LIMIT $3;
            `,
            address,
            skip,
            take
          );
        },
        page,
        pageSize
      );
    })(),
  ]);

  const latestBlock = await provider.getBlockNumber();

  return {
    meta: directDelegators.meta,
    data: [
      ...(page == 1
        ? advancedDelegators.map((advancedDelegator) => ({
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
          }))
        : []),
      ...(
        await Promise.all(
          directDelegators.data.map(async (directDelegator) => ({
            from: directDelegator.delegator,
            to: directDelegator.delegatee,
            allowance: await contracts.token.contract.balanceOf(
              directDelegator.delegator
            ),
            timestamp: latestBlock
              ? getHumanBlockTime(directDelegator.block_number, latestBlock)
              : null,
            type: "DIRECT",
            amount: "FULL",
          }))
        )
      ).filter((delegator) => delegator.allowance > BigInt(1e15)), // filter out delegators with 0 (or close to 0) balance
    ] as Delegation[],
  };
}

/**
 * Get the direct delegatee for a given address
 * @param addressOrENSName
 */
export const getDirectDelegatee = (addressOrENSName: string) =>
  addressOrEnsNameWrap(getDirectDelegateeForAddress, addressOrENSName);

const getDirectDelegateeForAddress = async ({
  address,
}: {
  address: string;
}) => {
  const { namespace } = Tenant.getInstance();
  const [proxyAddress, delegatee] = await Promise.all([
    getProxyAddress(address),
    prisma[`${namespace}Delegatees`].findFirst({
      where: { delegator: address.toLowerCase() },
    }),
  ]);

  if (delegatee?.delegatee === proxyAddress?.toLowerCase()) {
    return null;
  }

  return delegatee;
};

/**
 * Get all addresses that are in the delegation chain for a given address
 * @param addressOrENSName
 */
export const getAllDelegatorsInChains = (addressOrENSName: string) =>
  addressOrEnsNameWrap(getAllDelegatorsInChainsForAddress, addressOrENSName);

async function getAllDelegatorsInChainsForAddress({
  address,
}: {
  address: string;
}) {
  const { namespace, contracts } = Tenant.getInstance();
  const allAddresess = await prisma.$queryRawUnsafe<{ addresses: string[] }[]>(
    `
    SELECT array_agg(DISTINCT u.element) AS addresses
    FROM ${namespace + ".authority_chains"}, unnest(chain) as u(element)
    WHERE delegate=$1 AND contract=$2 AND allowance > 0;
    `,
    address,
    contracts.alligator!.address
  );

  return allAddresess[0].addresses;
}
