import { prismaWeb2Client } from "@/app/lib/prisma";
import { AuthorityChainsSnaps } from "./authorityChains";
import { validateChain } from "@/lib/alligatorUtils";
import Tenant from "@/lib/tenant/tenant";
import { cache } from "react";

async function getAuthorityChains({
  address,
  blockNumber,
}: {
  address: string;
  blockNumber: number;
}): Promise<Array<string[]>> {
  const { namespace, contracts, ui } = Tenant.current();
  const chainsQuery = (await prismaWeb2Client.$queryRawUnsafe(
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
        MAX(balance_ordinal) AS max_ordinal
      FROM ${namespace + ".authority_chains_snaps"}
      WHERE chain = ac.chain
        AND delegate = $1
        AND contract = $2
        AND balance_block_number <= $3
    ) AS max_blocks
    WHERE ac.delegate = $1
      AND ac.contract = $2
      AND ac.balance_ordinal = max_blocks.max_ordinal
      AND ac.balance > 0
      AND ac.allowance > 0;
    `,
    address.toLowerCase(),
    contracts.alligator?.address,
    blockNumber
  )) as AuthorityChainsSnaps[];

  const latestBlockNumberPromise: Promise<number> = ui.toggle(
    "use-l1-block-number"
  )?.enabled
    ? contracts.providerForTime?.getBlockNumber()
    : contracts.token.provider.getBlockNumber();

  const [chains, latestBlockNumber] = await Promise.all([
    chainsQuery,
    latestBlockNumberPromise,
  ]);

  const reversedChains = chains
    .filter((chain) => validateChain(chain, latestBlockNumber))
    .map((chain) => {
      const chains = chain.chain.reverse();
      chains.push(chain.delegate);
      return chains;
    })
    .sort((a, b) => b.length - a.length);

  // Only add the address to the chain if it's not already there
  if (
    reversedChains.length < 1 ||
    reversedChains[reversedChains.length - 1].length > 1
  ) {
    reversedChains.push([address]);
  }

  return reversedChains;
}

export const fetchAuthorityChains = cache(getAuthorityChains);
