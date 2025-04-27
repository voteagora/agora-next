import Tenant from "@/lib/tenant/tenant";
import { cache } from "react";
import { findVotableSupply } from "@/lib/prismaUtils";
import { unstable_cache } from "next/cache";
import { getVotableSupplyFromDaoNode } from "@/app/lib/dao-node/client";

async function getVotableSupply() {
  const { namespace, contracts, ui } = Tenant.current();
  const address = contracts.token.address;

  const useDaoNode =
    ui.toggle("use-daonode-for-votable-supply")?.enabled ?? false;

  try {
    if (useDaoNode) {
      return await getVotableSupplyFromDaoNode();
    }

    const votableSupply = await findVotableSupply({ namespace, address });
    return votableSupply?.votable_supply || "0";
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
    revalidate: 60 * 60 * 24 * 7, // 1 week
  }
);
