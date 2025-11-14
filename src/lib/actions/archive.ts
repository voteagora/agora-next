"use server";

import {
  fetchProposalsFromArchive,
  fetchProposalFromArchive,
} from "@/lib/archiveUtils";
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

export async function getArchivedProposal(proposalId: string) {
  try {
    const result = await fetchProposalFromArchive(namespace, proposalId);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error fetching archived proposal:", error);
    return {
      success: false,
      error: "Failed to fetch archived proposal",
      data: null,
    };
  }
}
