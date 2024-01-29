import prisma from "@/app/lib/prisma";
import { DEPLOYMENT_NAME } from "@/lib/config";

export async function getVotableSupply() {
  const votableSupply = await prisma[
    `${DEPLOYMENT_NAME}VotableSupply`
  ].findFirst({});
  if (!votableSupply) {
    throw new Error("No votable supply found");
  }
  return votableSupply.votable_supply;
}
