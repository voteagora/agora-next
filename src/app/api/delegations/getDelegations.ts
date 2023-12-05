import { resolveENSName } from "@/app/lib/utils";
import { isAddress } from "viem";
import { Delegation } from "./delegation";
import { getHumanBlockTime } from "@/lib/blockTimes";
import prisma from "@/app/lib/prisma";
import provider from "@/app/lib/provider";

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
