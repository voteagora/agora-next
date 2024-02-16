import { Delegation } from "./delegation";
import { getHumanBlockTime } from "@/lib/blockTimes";
import prisma from "@/app/lib/prisma";
import provider from "@/app/lib/provider";
import { getProxyAddress } from "@/lib/alligatorUtils";
import { contracts } from "@/lib/contracts/contracts";
import { addressOrEnsNameWrap } from "../utils/ensName";

/**
 * Delegations for a given address (addresses the given address is delegating to)
 * @param addressOrENSName
 * @param namespace - "optimism"
 * @returns {delegations}
 */
export const getCurrentDelegateesForNamespace = ({
  addressOrENSName,
  namespace,
}: {
  addressOrENSName: string;
  namespace: "optimism";
}) =>
  addressOrEnsNameWrap(getCurrentDelegateesForAddress, addressOrENSName, {
    namespace,
  });

async function getCurrentDelegateesForAddress({
  address,
  namespace,
}: {
  address: string;
  namespace: "optimism";
}): Promise<Delegation[]> {
  const advancedDelegatees = await prisma[
    `${namespace}AdvancedDelegatees`
  ].findMany({
    where: {
      from: address.toLowerCase(),
      delegated_amount: { gt: 0 },
      contract: contracts(namespace).alligator.address.toLowerCase(),
    },
  });

  // const directDelegatee = await (async () => {
  //   const [proxyAddress, delegatee] = await Promise.all([
  //     getProxyAddress(address),
  //     prisma.delegatees.findFirst({
  //       where: { delegator: address.toLowerCase() },
  //     }),
  //   ]);

  //   if (
  //     proxyAddress &&
  //     delegatee &&
  //     delegatee.delegatee === proxyAddress.toLowerCase()
  //   ) {
  //     return null;
  //   }

  //   return delegatee;
  // })();

  const latestBlock = await provider.getBlockNumber();

  // const advancedVotingPower = await prisma.advancedVotingPower.findFirst({
  //   where: {
  //     delegate: address.toLowerCase(),
  //   },
  // });

  // // TODO: These needs to be ordered by timestamp

  // console.log(address);
  // console.log({
  //   advancedVotingPower,
  //   advancedDelegatees,
  //   directDelegatee,
  // });

  return [
    // ...(advancedVotingPower
    //   ? [
    //       {
    //         from: address,
    //         to: address,
    //         allowance: advancedVotingPower.advanced_vp.toFixed(0),
    //         timestamp: null,
    //         type: "ADVANCED",
    //         amount:
    //           BigInt(advancedVotingPower.delegated_vp.toFixed(0)) > 0n
    //             ? "PARTIAL"
    //             : "FULL",
    //       },
    //     ]
    //   : []),
    // ...(directDelegatee
    //   ? [
    //       {
    //         from: directDelegatee.delegator,
    //         to: directDelegatee.delegatee,
    //         allowance: directDelegatee.balance.toFixed(),
    //         timestamp: latestBlock
    //           ? getHumanBlockTime(
    //               directDelegatee.block_number,
    //               latestBlock.number,
    //               latestBlock.timestamp
    //             )
    //           : null,
    //         type: "DIRECT",
    //         amount: "FULL",
    //       },
    //     ]
    //   : []),
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
 * @param namespace - "optimism"
 * @returns {Delegation[]}
 */
export const getCurrentDelegatorsForNamespace = ({
  addressOrENSName,
  namespace,
}: {
  addressOrENSName: string;
  namespace: "optimism";
}) =>
  addressOrEnsNameWrap(getCurrentDelegatorsForAddress, addressOrENSName, {
    namespace,
  });

async function getCurrentDelegatorsForAddress({
  address,
  namespace,
}: {
  address: string;
  namespace: "optimism";
}) {
  const advancedDelegators = prisma[`${namespace}AdvancedDelegatees`].findMany({
    where: {
      to: address.toLowerCase(),
      delegated_amount: { gt: 0 },
      contract: contracts(namespace).alligator.address.toLowerCase(),
    },
  });

  // KENT: Commented out Direct delegations, needs to be paginated and optimized for prod
  // const directDelegators = (async () => {
  //   const proxyAddress = await getProxyAddress(address);
  //   if (!proxyAddress) {
  //     return [];
  //   }
  //   return prisma.$queryRaw<Prisma.DelegateesGetPayload<true>[]>(
  //     Prisma.sql`
  //     SELECT *
  //     FROM (
  //     SELECT
  //       delegator,
  //       delegatee,
  //       block_number
  //     FROM (
  //       SELECT
  //           delegator,
  //           to_delegate as delegatee,
  //           block_number,
  //           ROW_NUMBER() OVER (PARTITION BY delegator ORDER BY block_number DESC, log_index DESC, transaction_index DESC) as rn
  //       FROM optimism.delegate_changed_events
  //       WHERE to_delegate=${address.toLowerCase()}
  //     ) t1
  //     WHERE rn=1
  //     ) t2
  //     LEFT JOIN LATERAL (
  //       SELECT
  //         COALESCE(SUM(
  //           CASE WHEN "from"=delegator THEN -"value"::NUMERIC ELSE "value"::NUMERIC END
  //         ), 0) AS balance
  //       FROM optimism.transfer_events
  //       WHERE "from"=delegator OR "to"=delegator
  //     ) t3 ON TRUE
  //     `
  //   );
  // })();

  const latestBlock = await provider.getBlockNumber();

  // TODO: These needs to be ordered by timestamp

  return [
    // KENT: Commented out Direct delegations, needs to be paginated and optimized for prod
    // ...(await directDelegators).map((directDelegator) => ({
    //   from: directDelegator.delegator,
    //   to: directDelegator.delegatee,
    //   allowance: directDelegator.balance.toFixed(0),
    //   timestamp: latestBlock
    //     ? getHumanBlockTime(
    //         directDelegator.block_number,
    //         latestBlock.number,
    //         latestBlock.timestamp
    //       )
    //     : null,
    //   type: "DIRECT",
    //   amount: "FULL",
    // })),

    ...(await advancedDelegators).map((advancedDelegator) => ({
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
    })),
  ] as Delegation[];
}

/**
 * Get the direct delegatee for a given address
 * @param addressOrENSName
 * @param namespace - "optimism"
 * @returns {delegatee}
 */
export const getDirectDelegateeForNamespace = ({
  addressOrENSName,
  namespace,
}: {
  addressOrENSName: string;
  namespace: "optimism";
}) =>
  addressOrEnsNameWrap(getDirectDelegateeForAddress, addressOrENSName, {
    namespace,
  });

const getDirectDelegateeForAddress = async ({
  address,
  namespace,
}: {
  address: string;
  namespace: "optimism";
}) => {
  const [proxyAddress, delegatee] = await Promise.all([
    getProxyAddress(address, namespace),
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
 * @param namespace - "optimism"
 * @returns {addresses}
 */

export const getAllDelegatorsInChainsForAddressForNamespace = ({
  addressOrENSName,
  namespace,
}: {
  addressOrENSName: string;
  namespace: "optimism";
}) =>
  addressOrEnsNameWrap(getAllDelegatorsInChainsForAddress, addressOrENSName, {
    namespace,
  });

async function getAllDelegatorsInChainsForAddress({
  address,
  namespace,
}: {
  address: string;
  namespace: "optimism";
}) {
  const allAddresess = await prisma.$queryRawUnsafe<{ addresses: string[] }[]>(
    `
    SELECT array_agg(DISTINCT u.element) AS addresses
    FROM ${namespace + ".authority_chains"}, unnest(chain) as u(element)
    WHERE delegate=$1 AND contract=$2 AND allowance > 0;
    `,
    address,
    contracts(namespace).alligator.address.toLowerCase()
  );

  return allAddresess[0].addresses;
}