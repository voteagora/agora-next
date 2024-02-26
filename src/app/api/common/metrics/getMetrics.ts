import prisma from "@/app/lib/prisma";
import { getTokenSupply } from "@/lib/tokenUtils";

export async function getMetricsForNamespace({
  namespace,
}: {
  namespace: "optimism";
}) {
  const totalSupply = await getTokenSupply(namespace);
  const votableSupply = await prisma[`${namespace}VotableSupply`].findFirst({});
  const quorum = (BigInt(Number(votableSupply?.votable_supply)) * 30n) / 100n;

  return {
    votableSupply: votableSupply?.votable_supply || "0",
    totalSupply: totalSupply.toString(),
    quorum,
  };
}
