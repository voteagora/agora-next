import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";

export async function getMetrics() {
  const { namespace, contracts } = Tenant.current();
  const totalSupply = await contracts.token.contract.totalSupply();
  const votableSupply = await (prisma as any)[`${namespace}VotableSupply`].findFirst({});

  return {
    votableSupply: votableSupply?.votable_supply || "0",
    totalSupply: totalSupply.toString(),
  };
}
