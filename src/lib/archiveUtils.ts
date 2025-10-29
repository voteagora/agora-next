import { PaginatedResult } from "@/app/lib/pagination";
import { ArchiveListProposal } from "./types/archiveProposal";
import {
  getArchiveSlugAllProposals,
  getArchiveSlugForDaoNodeProposal,
  getArchiveSlugForEasOodaoProposal,
} from "./constants";

const withCacheBust = (url: string) => {
  const now = Math.floor(Date.now() / 1000);
  const rounded = now - (now % 15);
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}t=${rounded}`;
};

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
    const archiveUrl = withCacheBust(getArchiveSlugAllProposals(namespace));
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
      filteredProposals = allProposals.filter((proposal) =>
        proposal.tags?.includes("tempcheck")
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

export const fetchProposalFromArchive = async (
  namespace: string,
  proposalId: string
) => {
  try {
    const archiveDaoNodeUrl = getArchiveSlugForDaoNodeProposal(
      namespace,
      proposalId
    );
    const archiveEasOodaoUrl = getArchiveSlugForEasOodaoProposal(
      namespace,
      proposalId
    );
    const [responseDaoNode, responseEasOodao] = await Promise.all([
      fetch(withCacheBust(archiveDaoNodeUrl), { cache: "no-store" }),
      fetch(withCacheBust(archiveEasOodaoUrl), { cache: "no-store" }),
    ]);

    if (!responseDaoNode.ok && !responseEasOodao.ok) {
      throw new Error(
        `Failed to fetch archive data: daoNode ${responseDaoNode.status} ${responseDaoNode.statusText}; easOodao ${responseEasOodao.status} ${responseEasOodao.statusText}`
      );
    }

    const [jsonTextDaoNode, jsonTextEasOodao] = await Promise.all([
      responseDaoNode.ok ? responseDaoNode.text() : Promise.resolve(""),
      responseEasOodao.ok ? responseEasOodao.text() : Promise.resolve(""),
    ]);
    const allProposalsDaoNode = responseDaoNode.ok
      ? JSON.parse(jsonTextDaoNode)
      : undefined;
    const allProposalsEasOodao = responseEasOodao.ok
      ? JSON.parse(jsonTextEasOodao)
      : undefined;
    return allProposalsDaoNode || allProposalsEasOodao;
  } catch (error) {
    console.error("Error fetching proposals from archive:", error);
    throw error;
  }
};
