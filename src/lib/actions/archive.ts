"use server";

import { fetchProposalsFromArchive } from "@/lib/archiveUtils";
import Tenant from "@/lib/tenant/tenant";

const { namespace } = Tenant.current();

export async function getArchivedProposals(filter: string = "all") {
  try {
    const result = await fetchProposalsFromArchive(namespace, filter);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  } catch (error) {
    console.error("Error fetching archived proposals:", error);
    return {
      success: false,
      error: "Failed to fetch archived proposals",
      data: [],
      meta: {
        has_next: false,
        total_returned: 0,
        next_offset: 0,
      },
    };
  }
}
