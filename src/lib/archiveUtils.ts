import { PaginatedResult } from "@/app/lib/pagination";
import { ArchiveListProposal } from "./types/archiveProposal";
import {
  getArchiveSlugAllProposals,
  getArchiveSlugForDaoNodeProposal,
  getArchiveSlugForEasOodaoProposal,
  getArchiveSlugForProposalNonVoters,
  getArchiveSlugForProposalVotes,
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
        (proposal) =>
          !proposal.cancel_event &&
          !proposal.delete_event &&
          proposal.lifecycle_stage !== "CANCELLED"
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

export type ArchiveVoteRow = {
  transaction_hash?: string | null;
  block_number?: number | string;
  chain_id?: number;
  voter: string;
  support?: string | null;
  weight?: string | number;
  ts?: number;
  x?: string | null;
  warpcast?: string | null;
  discord?: string | null;
};

export type ArchiveNonVoterRow = {
  addr: string;
  vp?: string | number;
  ens?: string | null;
  bn?: number | string;
  x?: string | null;
  warpcast?: string | null;
  discord?: string | null;
};

const isBrowser = typeof window !== "undefined";

async function gunzipToString(buffer: ArrayBuffer): Promise<string> {
  if (!isBrowser) {
    const { gunzipSync } = await import("zlib");
    return gunzipSync(Buffer.from(buffer)).toString("utf-8");
  }

  if (typeof (globalThis as any).DecompressionStream === "function") {
    const decompressedStream = new Response(buffer).body?.pipeThrough(
      new (globalThis as any).DecompressionStream("gzip")
    );

    if (!decompressedStream) {
      throw new Error("Failed to read gzip stream from response body");
    }

    return await new Response(decompressedStream).text();
  }

  throw new Error("Gzip decompression is not supported in this environment");
}

async function fetchArchiveNdjson<T>(url: string): Promise<T[]> {
  const response = await fetch(withCacheBust(url), {
    cache: "no-store",
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch archive data: ${response.status} ${response.statusText}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  let ndjsonText: string;
  try {
    ndjsonText = await gunzipToString(arrayBuffer);
  } catch (error) {
    console.warn(
      `Failed to decompress archive payload from ${url}, falling back to plain text`,
      error
    );
    const decoder = new TextDecoder();
    ndjsonText = decoder.decode(arrayBuffer);
  }
  return parseNDJSON<T>(ndjsonText);
}

/**
 * Fetch raw vote data from archive without transformation
 * Use this when you want to transform the data on the client side
 */
export async function fetchRawProposalVotesFromArchive({
  namespace,
  proposalId,
}: {
  namespace: string;
  proposalId: string;
}): Promise<ArchiveVoteRow[]> {
  try {
    return await fetchArchiveNdjson<ArchiveVoteRow>(
      getArchiveSlugForProposalVotes(namespace, proposalId)
    );
  } catch (error) {
    console.error("Error fetching raw votes from archive:", error);
    throw error;
  }
}

export type ArchiveNonVoter = {
  delegate: string;
  voting_power: string;
  twitter: string | null;
  warpcast: string | null;
  discord: string | null;
  citizen_type: string | null;
  voterMetadata: {
    name: string;
    image: string;
    type: string;
  } | null;
};

/**
 * Fetch raw non-voter data from archive without transformation
 * Use this when you want to transform the data on the client side
 */
export async function fetchRawProposalNonVotersFromArchive({
  namespace,
  proposalId,
}: {
  namespace: string;
  proposalId: string;
}): Promise<ArchiveNonVoterRow[]> {
  try {
    return await fetchArchiveNdjson<ArchiveNonVoterRow>(
      getArchiveSlugForProposalNonVoters(namespace, proposalId)
    );
  } catch (error) {
    console.error("Error fetching raw non-voters from archive:", error);
    throw error;
  }
}

/**
 * Fetch and transform non-voter data from archive
 * @deprecated Use fetchRawProposalNonVotersFromArchive and transform on client side when possible
 */
export async function fetchProposalNonVotersFromArchive({
  namespace,
  proposalId,
}: {
  namespace: string;
  proposalId: string;
}): Promise<ArchiveNonVoter[]> {
  try {
    const rows = await fetchArchiveNdjson<ArchiveNonVoterRow>(
      getArchiveSlugForProposalNonVoters(namespace, proposalId)
    );

    const seen = new Set<string>();

    return rows.reduce<ArchiveNonVoter[]>((acc, row) => {
      const address = row.addr?.toLowerCase();
      if (!address || seen.has(address)) {
        return acc;
      }

      seen.add(address);

      acc.push({
        delegate: address,
        voting_power: row.vp !== undefined ? String(row.vp) : "0",
        twitter: row.x ?? null,
        warpcast: row.warpcast ?? null,
        discord: row.discord ?? null,
        citizen_type: null,
        voterMetadata: row.ens
          ? {
              name: row.ens,
              image: "",
              type: "",
            }
          : null,
      });

      return acc;
    }, []);
  } catch (error) {
    console.error("Error fetching non-voters from archive:", error);
    throw error;
  }
}
