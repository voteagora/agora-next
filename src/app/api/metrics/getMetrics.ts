import prisma from "@/app/lib/prisma";
import { getTokenSupply } from "@/lib/tokenUtils";
import { getCurrentQuorum } from "@/lib/governorUtils";

import "server-only";

export async function getMetrics() {
  const totalSupply = await getTokenSupply("OPTIMISM");
  const votableSupply = await prisma.votableSupply.findFirst({});
  const quorum = (BigInt(Number(votableSupply?.votable_supply)) * 30n) / 100n;
  // const quorum = await getCurrentQuorum("OPTIMISM");

  return {
    votableSupply: votableSupply?.votable_supply || "0",
    totalSupply: totalSupply.toString(),
    quorum,
  };
}
