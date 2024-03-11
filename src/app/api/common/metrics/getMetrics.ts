import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";

export async function getMetrics() {
  const { namespace, contracts } = Tenant.getInstance();
  const totalSupply = await contracts.token.contract.totalSupply();
  const votableSupply = await prisma[`${namespace}VotableSupply`].findFirst({});

  return {
    votableSupply: votableSupply?.votable_supply || "0",
    totalSupply: totalSupply.toString(),
  };
}
