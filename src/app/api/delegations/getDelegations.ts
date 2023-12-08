import { resolveENSName } from "@/app/lib/utils";
import { isAddress } from "viem";
import { Delegation } from "./delegation";
import { getHumanBlockTime } from "@/lib/blockTimes";
import { Prisma } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import provider from "@/app/lib/provider";
import { getProxyAddress } from "@/lib/alligatorUtils";

export async function getCurrentDelegatees({
  addressOrENSName,
}: {
  addressOrENSName: string;
}): Promise<Delegation[]> {
  const address = isAddress(addressOrENSName)
    ? addressOrENSName.toLowerCase()
    : await resolveENSName(addressOrENSName);

  const advancedDelegatees = await prisma.advancedDelegatees.findMany({
    where: { from: address.toLowerCase() },
  });

  const directDelegatee = await prisma.delegatees.findFirst({
    where: { delegator: address.toLowerCase() },
  });

  const latestBlock = await provider.getBlock("latest");

  // TODO: These needs to be ordered by timestamp

  return [
    ...(directDelegatee
      ? [
          {
            from: directDelegatee.delegator,
            to: directDelegatee.delegatee,
            allowance: directDelegatee.balance.toFixed(),
            timestamp: latestBlock
              ? getHumanBlockTime(
                  directDelegatee.block_number,
                  latestBlock.number,
                  latestBlock.timestamp
                )
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
        ? getHumanBlockTime(
            advancedDelegatee.block_number,
            latestBlock.number,
            latestBlock.timestamp
          )
        : null,
      type: "ADVANCED",
      amount:
        Number(advancedDelegatee.delegated_share.toFixed(0)) === 1
          ? "FULL"
          : "PARTIAL",
    })),
  ] as Delegation[];
}

export async function getCurrentDelegators({
  addressOrENSName,
}: {
  addressOrENSName: string;
}) {
  const address = isAddress(addressOrENSName)
    ? addressOrENSName.toLowerCase()
    : await resolveENSName(addressOrENSName);

  const advancedDelegators = prisma.advancedDelegatees.findMany({
    where: { to: address.toLowerCase() },
  });

  const directDelegators = (async () => {
    const proxyAddress = await getProxyAddress(address);
    if (!proxyAddress) {
      return [];
    }
    return prisma.$queryRaw<Prisma.DelegateesGetPayload<true>[]>(
      Prisma.sql`
      SELECT *
      FROM (
      SELECT 
        delegator,
        delegatee,
        block_number
      FROM (
        SELECT 
            delegator,
            to_delegate as delegatee,
            block_number,
            ROW_NUMBER() OVER (PARTITION BY delegator ORDER BY block_number DESC, log_index DESC, transaction_index DESC) as rn
        FROM center.delegate_changed_events
        WHERE to_delegate=${proxyAddress.toLowerCase()}
      ) t1
      WHERE rn=1
      ) t2
      LEFT JOIN LATERAL (
        SELECT 
          SUM(
            CASE WHEN "from"=delegator THEN -"value"::NUMERIC ELSE "value"::NUMERIC END
          ) AS balance
        FROM center.transfer_events
        WHERE "from"=delegator OR "to"=delegator
      ) t3 ON TRUE
      `
    );
  })();

  const latestBlock = await provider.getBlock("latest");

  // TODO: These needs to be ordered by timestamp

  return [
    ...(await directDelegators).map((directDelegator) => ({
      from: directDelegator.delegator,
      to: directDelegator.delegatee,
      allowance: directDelegator.balance.toFixed(),
      timestamp: latestBlock
        ? getHumanBlockTime(
            directDelegator.block_number,
            latestBlock.number,
            latestBlock.timestamp
          )
        : null,
      type: "DIRECT",
      amount: "FULL",
    })),

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
        Number(advancedDelegator.delegated_share.toFixed(0)) === 1
          ? "FULL"
          : "PARTIAL",
    })),
  ] as Delegation[];
}
