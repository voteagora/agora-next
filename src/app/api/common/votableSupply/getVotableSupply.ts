import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { cache } from "react";

async function getVotableSupply() {
  const { namespace } = Tenant.current();
  const votableSupply = await prisma[`${namespace}VotableSupply`].findFirst({});

  if (!votableSupply) {
    // TODO: Remove this once the data is in the DB
    return "100000";
    // throw new Error("No votable supply found");
  }
  return votableSupply.votable_supply;
}

export const fetchVotableSupply = cache(getVotableSupply);
