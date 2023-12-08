import prisma from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getVotingPowerAtSnapshot({
  address,
  blockNumber,
}: {
  address: string;
  blockNumber: number;
}): Promise<{ directVP: string; advancedVP: string; totalVP: string }> {
  const votingPower = await prisma.votingPowerSnaps.findFirst({
    where: {
      delegate: address,
      block_number: {
        lte: blockNumber,
      },
    },
    orderBy: {
      block_number: "desc",
    },
  });

  // This query pulls only partially delegated voting power
  const advancedVotingPower = await prisma.$queryRaw<
    Prisma.AdvancedVotingPowerGetPayload<true>[]
  >(
    Prisma.sql`
    SELECT
      delegate,
      vp_allowance,
      vp_allowance * COALESCE(subdelegated_share, 0) as delegated_vp,
        vp_allowance * (1 - COALESCE(subdelegated_share, 0)) as advanced_vp
    FROM (
        SELECT
            a.delegate,
            subdelegated_share,
            SUM(allowance) as vp_allowance
        FROM (
            SELECT chain_str
            FROM center.advanced_voting_power_raw_snaps
            GROUP BY chain_str
        ) s
        LEFT JOIN LATERAL (
            SELECT
                delegate,
                allowance,
                subdelegated_share,
                block_number
            FROM center.advanced_voting_power_raw_snaps
            WHERE chain_str=s.chain_str AND block_number <= ${blockNumber}
            ORDER BY block_number DESC
            LIMIT 1
        ) AS a ON TRUE
        GROUP BY 1, 2
    ) t
    WHERE delegate=${address};
    `
  );

  return {
    directVP: votingPower?.balance ?? "0",
    advancedVP: advancedVotingPower[0]?.advanced_vp.toFixed() ?? "0",
    totalVP: (
      BigInt(votingPower?.balance ?? "0") +
      BigInt(advancedVotingPower[0]?.advanced_vp.toFixed() ?? "0")
    ).toString(),
  };
}
