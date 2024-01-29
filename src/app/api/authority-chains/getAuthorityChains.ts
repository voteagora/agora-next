import prisma from "@/app/lib/prisma";
import { DEPLOYMENT_NAME } from "@/lib/config";
import { OptimismContracts } from "@/lib/contracts/contracts";
import { OptimismAuthorityChainsSnaps } from "@prisma/client";

type AuthorityChainsSnaps = OptimismAuthorityChainsSnaps;

export async function getAuthorityChains({
  address,
  blockNumber,
}: {
  address: string;
  blockNumber: number;
}): Promise<Array<string[]>> {
  const chains = await prisma.$queryRawUnsafe<AuthorityChainsSnaps[]>(
    `
    SELECT
      ac.chain,
      ac.rules,
      ac.delegate,
      ac.balance,
      ac.balance_block_number,
      ac.allowance
    FROM ${DEPLOYMENT_NAME + ".authority_chains_snaps"} ac
    CROSS JOIN LATERAL (
      SELECT
        MAX(balance_block_number) AS max_block_number
      FROM ${DEPLOYMENT_NAME + ".authority_chains_snaps"}
      WHERE chain = ac.chain
        AND delegate = $1
        AND contract = $2
        AND balance_block_number <= $3
    ) AS max_blocks
    WHERE ac.delegate = $1
      AND ac.contract = $2
      AND ac.balance_block_number = max_blocks.max_block_number
      AND ac.balance > 0
      AND ac.allowance > 0;
    `,
    address.toLowerCase(),
    OptimismContracts.alligator.address.toLowerCase(),
    blockNumber
  );

  const reversedChains = chains
    .map((chain) => {
      const chains = chain.chain.reverse();
      chains.push(chain.delegate);
      return chains;
    })
    .sort((a, b) => b.length - a.length);

  reversedChains.push([address]);

  return reversedChains;
}
