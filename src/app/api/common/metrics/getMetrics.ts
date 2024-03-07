import prisma from "@/app/lib/prisma";
import { getTokenSupply } from "@/lib/tokenUtils";
import Tenant from "@/lib/tenant";

export async function getMetrics() {
  const { namespace } = Tenant.getInstance();
  const [totalSupply, votableSupply, uniqueVotersCount] =
    await Promise.all([
      await getTokenSupply(namespace),
      await prisma[`${namespace}VotableSupply`].findFirst({}),
      await prisma.$queryRawUnsafe<{ unique_voters_count: bigint }[]>(
        `
      SELECT COUNT(DISTINCT delegates) AS unique_voters_count
      FROM optimism.delegates;
      `
      )
    ]);

  return {
    votableSupply: votableSupply?.votable_supply || "0",
    totalSupply: totalSupply.toString(),
    uniqueVotersCount: uniqueVotersCount[0]?.unique_voters_count.toString() || '0'
  };
}
