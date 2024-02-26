import prisma from "@/app/lib/prisma";

export async function getVotableSupplyForNamespace({
  namespace,
}: {
  namespace: "optimism";
}) {
  const votableSupply = await prisma[`${namespace}VotableSupply`].findFirst({});
  if (!votableSupply) {
    throw new Error("No votable supply found");
  }
  return votableSupply.votable_supply;
}
