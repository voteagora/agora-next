import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";

export async function getVotableSupply() {
  const { namespace } = Tenant.current();
  const votableSupply = await (prisma as any)[`${namespace}VotableSupply`].findFirst({});
  if (!votableSupply) {
    throw new Error("No votable supply found");
  }
  return votableSupply.votable_supply;
}
