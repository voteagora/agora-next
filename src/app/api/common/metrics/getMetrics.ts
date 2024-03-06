import prisma from "@/app/lib/prisma";
import { getTokenSupply } from "@/lib/tokenUtils";
import Tenant from "@/lib/tenant/tenant";

export async function getMetrics() {
  const { namespace } = Tenant.getInstance();
  const totalSupply = await getTokenSupply();
  const votableSupply = await prisma[`${namespace}VotableSupply`].findFirst({});
  const quorum = (BigInt(Number(votableSupply?.votable_supply)) * 30n) / 100n;

  return {
    votableSupply: votableSupply?.votable_supply || "0",
    totalSupply: totalSupply.toString(),
    quorum,
  };
}
