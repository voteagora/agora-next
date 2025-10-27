import { PaginatedResult } from "@/app/lib/pagination";
import { getArchiveSlugAllProposals } from "./constants";
import { ArchiveListProposal } from "./types/archiveProposal";

/**
 * Parse NDJSON (Newline Delimited JSON) string to array of objects
 */
function parseNDJSON<T>(ndjsonString: string): T[] {
  const lines = ndjsonString
    .split("\n")
    .filter((line) => line.trim().length > 0);
  const parsed: T[] = [];

  for (let i = 0; i < lines.length; i++) {
    try {
      parsed.push(JSON.parse(lines[i]));
    } catch (error) {
      console.error(`Failed to parse NDJSON line ${i + 1}:`, error);
      // Skip malformed lines and continue
    }
  }

  return parsed;
}

/**
 * Fetch and parse proposals from GCS archive in NDJSON format
 */
export async function fetchProposalsFromArchive(
  namespace: string,
  filter: string
): Promise<PaginatedResult<ArchiveListProposal[]>> {
  try {
    const archiveUrl = getArchiveSlugAllProposals(namespace);
    const response = await fetch(archiveUrl, {
      cache: "no-store", // Disable caching for fresh data
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch archive data: ${response.status} ${response.statusText}`
      );
    }

    const ndjsonText = await response.text();
    const allProposals = parseNDJSON<ArchiveListProposal>(ndjsonText);

    // Apply filter if needed
    let filteredProposals = allProposals;
    if (filter === "relevant") {
      // Filter out cancelled/deleted proposals for "relevant" filter
      filteredProposals = allProposals.filter(
        (proposal) => !proposal.cancel_event && !proposal.delete_event
      );
    } else if (filter === "temp-checks") {
      filteredProposals = allProposals.filter(
        (proposal) => proposal.data_eng_properties?.source === "eas-oodao"
      );
    }

    return {
      meta: {
        has_next: false,
        total_returned: filteredProposals.length,
        next_offset: 0,
      },
      data: filteredProposals,
    };
  } catch (error) {
    console.error("Error fetching proposals from archive:", error);
    throw error;
  }
}
