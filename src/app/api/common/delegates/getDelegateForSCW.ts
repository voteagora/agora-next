import "server-only";

import prisma from "@/app/lib/prisma";
import { cache } from "react";
import Tenant from "@/lib/tenant/tenant";

// Returns an owner delegate for a given SCW address
async function getDelegateForSCW(address: string) {
  const { slug } = Tenant.current();

  return prisma.delegateStatements
    .findFirst({
      where: { scw_address: address.toLowerCase(), dao_slug: slug },
    })
    .catch((error) => console.error(error));
}

export const fetchDelegateForSCW = cache(getDelegateForSCW);
