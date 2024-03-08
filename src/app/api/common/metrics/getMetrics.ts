import prisma from "@/app/lib/prisma";
import { getTokenSupply } from "@/lib/tokenUtils";
import Tenant from "@/lib/tenant";

export async function getMetrics() {
  const { namespace } = Tenant.getInstance();
  const [totalSupply, votableSupply] =
    await Promise.all([
      getTokenSupply(namespace),
      prisma[`${namespace}VotableSupply`].findFirst({}),
    ]);

  return {
    votableSupply: votableSupply?.votable_supply || "0",
    totalSupply: totalSupply.toString(),
  };
}
