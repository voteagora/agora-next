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
      distinct(chain),
      rules,
      delegate,
      balance,
      balance_block_number,
      allowance
    FROM center.authority_chains_snaps
    WHERE delegate=${address.toLowerCase()} 
      AND contract=${OptimismContracts.alligator.address.toLowerCase()}
      AND balance_block_number <= ${blockNumber} 
    `
  );

  return chains.map((chain: AuthorityChainsSnaps) => {
    const chains = chain.chain.reverse();
    chains.push(chain.delegate);
    return chains;
  });
}
