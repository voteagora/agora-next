import prisma from "@/app/lib/prisma";
import { DEPLOYMENT_NAME } from "@/lib/config";
import { getTokenSupply } from "@/lib/tokenUtils";

export async function getMetrics() {
  const totalSupply = await getTokenSupply("OPTIMISM");
  const votableSupply = await prisma[
    `${DEPLOYMENT_NAME}VotableSupply`
  ].findFirst({});
  const quorum = (BigInt(Number(votableSupply?.votable_supply)) * 30n) / 100n;
  // const quorum = await getCurrentQuorum("OPTIMISM");

  return {
    votableSupply: votableSupply?.votable_supply || "0",
    totalSupply: totalSupply.toString(),
    quorum,
  };
}
