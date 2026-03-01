import { PaginatedResult } from "@/app/lib/pagination";
import { ArchiveListProposal } from "./types/archiveProposal";
import {
  getArchiveSlugAllProposals,
  getArchiveSlugForDaoNodeProposal,
  getArchiveSlugForEasOodaoProposal,
  getArchiveSlugForProposalNonVoters,
  getArchiveSlugForProposalVotes,
} from "./constants";

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
    const archiveUrls = getArchiveSlugAllProposals(namespace);
    const proposalBuckets = await Promise.all(
      archiveUrls.map((url) => fetchArchiveNdjson<ArchiveListProposal>(url))
    );

    const allProposals = proposalBuckets
      .flat()
      .filter((proposal) => {
        return !(
          proposal.hybrid === true &&
          proposal.data_eng_properties?.source === "eas-atlas"
        );
      })
      .sort((a, b) => {
        const aTime = Number(a.start_blocktime ?? a.start_block ?? 0);
        const bTime = Number(b.start_blocktime ?? b.start_block ?? 0);
        return bTime - aTime;
      });
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
      return {
        meta: {
          has_next: false,
          total_returned: 0,
          next_offset: 0,
        },
        data: [],
      };
    }
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
      fetch(archiveDaoNodeUrl, { next: { revalidate: 60 } }),
      fetch(archiveEasOodaoUrl, { next: { revalidate: 60 } }),
    ]);

    if (!responseDaoNode.ok && !responseEasOodao.ok) {
      if (responseDaoNode.status === 404 && responseEasOodao.status === 404) {
        return null;
      }
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

    let proposal = allProposalsDaoNode || allProposalsEasOodao;

    return proposal;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
      return null;
    }
    console.error("Error fetching proposals from archive:", error);
    throw error;
  }
};

export type ArchiveVoteRow = {
  citizen_type?: string | null;
  transaction_hash?: string | null;
  block_number: bigint;
  chain_id?: number | null;
  voter: string;
  support?: string | null;
  weight?: string | number;
  reason?: string | null;
  params?: Array<number> | null;
  choice?: Array<number> | null; // for Copeland proposal type
  vp?: string | number; // for Copeland proposal type
  ts?: number | string | null;
  x?: string | null;
  warpcast?: string | null;
  discord?: string | null;
  name?: string | null;
  image?: string | null;
  ens?: string | null;
};

export type ArchiveNonVoterRow = {
  citizen_type?: string | null;
  addr: string;
  vp?: string | number;
  ens?: string | null;
  bn?: number | string;
  x?: string | null;
  warpcast?: string | null;
  discord?: string | null;
  name?: string | null;
  image?: string | null;
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
  const response = await fetch(url, {
    next: { revalidate: 60 },
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
      return [];
    }
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
      return [];
    }
    console.error("Error fetching raw non-voters from archive:", error);
    throw error;
  }
}
