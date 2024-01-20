import { Delegation } from "./delegation";
import { getHumanBlockTime } from "@/lib/blockTimes";
import { Prisma } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import provider from "@/app/lib/provider";
import { getProxyAddress } from "@/lib/alligatorUtils";
import { addressOrEnsNameWrap } from "../utils/ensName";
import { OptimismContracts } from "@/lib/contracts/contracts";

/**
 * Delegations for a given address (addresses the given address is delegating to)
 * @param addressOrENSName
 * @returns {delegations}
 */
export const getCurrentDelegatees = ({
  addressOrENSName,
}: {
  addressOrENSName: string;
}) => addressOrEnsNameWrap(getCurrentDelegateesForAddress, addressOrENSName);

async function getCurrentDelegateesForAddress({
  address,
}: {
  address: string;
}): Promise<Delegation[]> {
  const advancedDelegatees = await prisma.advancedDelegatees.findMany({
    where: {
      from: address.toLowerCase(),
      delegated_amount: { gt: 0 },
      contract: OptimismContracts.alligator.address.toLowerCase(),
    },
  });

  console.log("advancedDelegatees result", advancedDelegatees);

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

  const latestBlock = await provider.getBlock("latest");

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
        ? getHumanBlockTime(
            advancedDelegatee.block_number,
            latestBlock.number,
            latestBlock.timestamp
          )
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
 * @returns {Delegation[]}
 */
export const getCurrentDelegators = ({
  addressOrENSName,
}: {
  addressOrENSName: string;
}) => addressOrEnsNameWrap(getCurrentDelegatorsForAddress, addressOrENSName);

async function getCurrentDelegatorsForAddress({
  address,
}: {
  address: string;
}) {
  const advancedDelegators = prisma.advancedDelegatees.findMany({
    where: {
      to: address.toLowerCase(),
      delegated_amount: { gt: 0 },
      contract: OptimismContracts.alligator.address.toLowerCase(),
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
  //       FROM center.delegate_changed_events
  //       WHERE to_delegate=${address.toLowerCase()}
  //     ) t1
  //     WHERE rn=1
  //     ) t2
  //     LEFT JOIN LATERAL (
  //       SELECT
  //         COALESCE(SUM(
  //           CASE WHEN "from"=delegator THEN -"value"::NUMERIC ELSE "value"::NUMERIC END
  //         ), 0) AS balance
  //       FROM center.transfer_events
  //       WHERE "from"=delegator OR "to"=delegator
  //     ) t3 ON TRUE
  //     `
  //   );
  // })();

  const latestBlock = await provider.getBlock("latest");

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
        ? getHumanBlockTime(
            advancedDelegator.block_number,
            latestBlock.number,
            latestBlock.timestamp
          )
        : null,
      type: "ADVANCED",
      amount:
        Number(advancedDelegator.delegated_share.toFixed(3)) === 1
          ? "FULL"
          : "PARTIAL",
    })),
  ] as Delegation[];
}

const getDirectDelegateeForAddress = async ({
  address,
}: {
  address: string;
}) => {
  const [proxyAddress, delegatee] = await Promise.all([
    getProxyAddress(address),
    prisma.delegatees.findFirst({
      where: { delegator: address.toLowerCase() },
    }),
  ]);

  if (delegatee?.delegatee === proxyAddress?.toLowerCase()) {
    return null;
  }

  return delegatee;
};

export const getDirectDelegatee = ({
  addressOrENSName,
}: {
  addressOrENSName: string;
}) => addressOrEnsNameWrap(getDirectDelegateeForAddress, addressOrENSName);
