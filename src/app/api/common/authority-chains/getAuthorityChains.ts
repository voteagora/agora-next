import prisma from "@/app/lib/prisma";
import provider from "@/app/lib/provider";
import { contracts } from "@/lib/contracts/contracts";
import { AuthorityChainsSnaps } from "./authorityChains";
import { validateChain } from "@/lib/alligatorUtils";

export async function getAuthorityChainsForNamespace({
  address,
  blockNumber,
  namespace,
}: {
  address: string;
  blockNumber: number;
  namespace: "optimism";
}): Promise<Array<string[]>> {
  const chainsQuery = prisma.$queryRawUnsafe<AuthorityChainsSnaps[]>(
    `
    SELECT
      ac.chain,
      ac.rules,
      ac.delegate,
      ac.balance,
      ac.balance_block_number,
      ac.allowance
    FROM ${namespace + ".authority_chains_snaps"} ac
    CROSS JOIN LATERAL (
      SELECT
        MAX(balance_block_number) AS max_block_number
      FROM ${namespace + ".authority_chains_snaps"}
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
    contracts(namespace).alligator.address.toLowerCase(),
    blockNumber
  );

  const [chains, latestBlockNumber] = await Promise.all([
    chainsQuery,
    provider.getBlockNumber(),
  ]);

  const reversedChains = chains
    .filter((chain) => validateChain(chain, latestBlockNumber))
    .map((chain) => {
      const chains = chain.chain.reverse();
      chains.push(chain.delegate);
      return chains;
    })
    .sort((a, b) => b.length - a.length);

  reversedChains.push([address]);

  return reversedChains;
}
