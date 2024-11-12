import Tenant from "@/lib/tenant/tenant";
import { cache } from "react";
import { findVotableSupply } from "@/lib/prismaUtils";

async function getVotableSupply() {
  const { namespace } = Tenant.current();
  try {
    const votableSupply = await findVotableSupply({ namespace });
    return votableSupply?.votable_supply || "0";
  } catch (error) {
    console.log("Error fetching votable supply:", error);

    // Handle prisma errors for new tenants when votable supply is not available
    // 1 is returned to avoid zero division errors
    return "1";
  }
}

export const fetchVotableSupply = cache(getVotableSupply);
