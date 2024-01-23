import prisma from "@/app/lib/prisma";
import { OptimismContracts } from "@/lib/contracts/contracts";
import { AuthorityChainsSnaps, Prisma } from "@prisma/client";

export async function getAuthorityChains({
  address,
  blockNumber,
}: {
  address: string;
  blockNumber: number;
}): Promise<Array<string[]>> {
  const chains = await prisma.$queryRaw<
    Prisma.AuthorityChainsSnapsGetPayload<true>[]
  >(
    Prisma.sql`
    SELECT
      ac.chain,
      ac.rules,
      ac.delegate,
      ac.balance,
      ac.balance_block_number,
      ac.allowance
    FROM center.authority_chains_snaps ac
    CROSS JOIN LATERAL (
      SELECT
        MAX(balance_block_number) AS max_block_number
      FROM center.authority_chains_snaps
      WHERE chain = ac.chain
        AND delegate = ${address.toLowerCase()}
        AND contract = ${OptimismContracts.alligator.address.toLowerCase()}
        AND balance_block_number <= ${blockNumber}
    ) AS max_blocks
    WHERE ac.delegate = ${address.toLowerCase()}
      AND ac.contract = ${OptimismContracts.alligator.address.toLowerCase()}
      AND ac.balance_block_number = max_blocks.max_block_number
      AND ac.balance > 0
      AND ac.allowance > 0;
    `
  );

  const reversedChains = chains
    .map((chain: AuthorityChainsSnaps) => {
      const chains = chain.chain.reverse();
      chains.push(chain.delegate);
      return chains;
    })
    .sort((a, b) => b.length - a.length);

  reversedChains.push([address]);

  return reversedChains;
}
