import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant";

export async function getVotableSupply() {
  const { namespace } = Tenant.getInstance();
  const votableSupply = await prisma[`${namespace}VotableSupply`].findFirst({});
  if (!votableSupply) {
    throw new Error("No votable supply found");
  }
  return votableSupply.votable_supply;
}
