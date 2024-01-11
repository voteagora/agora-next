import prisma from "@/app/lib/prisma";

import "server-only";

export async function getVotableSupply() {
  const votableSupply = await prisma.votableSupply.findFirst({});
  if (!votableSupply) {
    throw new Error("No votable supply found");
  }
  return votableSupply.votable_supply;
}
