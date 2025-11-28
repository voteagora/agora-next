import "server-only";

import { prismaWeb2Client } from "@/app/lib/web2";
import Tenant from "@/lib/tenant/tenant";
import { unstable_cache } from "next/cache";

// Returns an owner delegate for a given SCW address
async function getDelegateForSCW(address: string) {
  const { slug } = Tenant.current();

  const result = await prismaWeb2Client.delegateStatements
    .findFirst({
      where: { scw_address: address.toLowerCase(), dao_slug: slug },
    })
    .catch((error) => console.error(error));

  // Remove email from payload if it exists
  if (result && result.payload && typeof result.payload === "object") {
    const { email: _, ...payloadWithoutEmail } = result.payload as any;
    result.payload = payloadWithoutEmail;
  }

  return result;
}

export const fetchDelegateForSCW = unstable_cache(
  async (address: string) => {
    return getDelegateForSCW(address);
  },
  [],
  {
    revalidate: 60, // 1 minute cache
  }
);
