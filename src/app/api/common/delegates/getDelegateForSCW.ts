import "server-only";

import { prismaWeb2Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { unstable_cache } from "next/cache";

// Returns an owner delegate for a given SCW address
async function getDelegateForSCW(address: string) {
  const { slug } = Tenant.current();

  return prismaWeb2Client.delegateStatements
    .findFirst({
      where: { scw_address: address.toLowerCase(), dao_slug: slug },
    })
    .catch((error) => console.error(error));
}

export const fetchDelegateForSCW = unstable_cache(
  async (address: string) => {
    return getDelegateForSCW(address);
  },
  [],
  {
    revalidate: 3600, // 1 hour cache
  }
);
