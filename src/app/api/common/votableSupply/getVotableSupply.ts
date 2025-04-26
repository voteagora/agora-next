import Tenant from "@/lib/tenant/tenant";
import { cache } from "react";
import { findVotableSupply } from "@/lib/prismaUtils";
import { unstable_cache } from "next/cache";

async function getVotableSupply() {
  const { namespace, contracts } = Tenant.current();
  const address = contracts.token.address;
  try {
    // const votableSupply = await findVotableSupply({ namespace, address });
    return "0" //votableSupply?.votable_supply || "0";
  } catch (error) {
    console.log("Error fetching votable supply:", error);

    // Handle prisma errors for new tenants when votable supply is not available
    // 1 is returned to avoid zero division errors
    return "1";
  }
}

export const fetchVotableSupply = cache(getVotableSupply);
export const fetchVotableSupplyUnstableCache = unstable_cache(
  getVotableSupply,
  [],
  {
    tags: ["votableSupply"],
    revalidate: 604800, // 1 week
  }
);
