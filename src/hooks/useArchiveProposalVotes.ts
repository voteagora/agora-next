import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { ProposalType } from "@/lib/types";
import type { ArchiveVoteRow, ArchiveNonVoterRow } from "@/lib/archiveUtils";
import { parseSupport } from "@/lib/voteUtils";
import type {
  VotesSort,
  VotesSortOrder,
  VoterTypes,
} from "@/app/api/common/votes/vote";

export type ArchiveVote = {
  transactionHash: string | null;
  address: string;
  support: "AGAINST" | "ABSTAIN" | "FOR" | null;
  weight: string;
  citizenType: string | null;
  voterMetadata: {
    name: string | null;
    image: string | null;
    type: string | null;
  } | null;
  proposalId: string;
  proposalType: ProposalType;
  params: number[] | null;
  reason: string | null;
  blockNumber: bigint;
  timestamp: Date | null;
};

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

const ARCHIVE_VOTES_QK = "archiveVotes";
const ARCHIVE_NON_VOTERS_QK = "archiveNonVoters";

type ArchiveVotesProcessingOptions = {
  sort?: VotesSort;
  sortOrder?: VotesSortOrder;
  voterType?: VoterTypes["type"];
};

function parseComparableBigInt(value: string | number | bigint | undefined) {
  if (typeof value === "bigint") {
    return value;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? BigInt(Math.trunc(value)) : 0n;
  }

  if (typeof value === "string") {
    try {
      return BigInt(value);
    } catch {
      return 0n;
    }
  }

  return 0n;
}

function compareBigIntLike(
  a: string | number | bigint | undefined,
  b: string | number | bigint | undefined
) {
  const aValue = parseComparableBigInt(a);
  const bValue = parseComparableBigInt(b);

  if (aValue === bValue) {
    return 0;
  }

  return aValue < bValue ? -1 : 1;
}

function matchesArchiveVoterType(
  citizenType: string | null | undefined,
  voterType: VoterTypes["type"]
) {
  const normalizedCitizenType = citizenType?.toUpperCase();
  const selectedType = voterType.toUpperCase();

  if (selectedType === "ALL") {
    return true;
  }

  if (selectedType === "TH") {
    return !normalizedCitizenType;
  }

  if (selectedType === "CH") {
    return !!normalizedCitizenType;
  }

  return normalizedCitizenType === selectedType;
}

export function processArchiveVotes(
  votes: ArchiveVote[],
  {
    sort = "weight",
    sortOrder = "desc",
    voterType = "ALL",
  }: ArchiveVotesProcessingOptions
) {
  const direction = sortOrder === "asc" ? 1 : -1;

  return votes
    .filter((vote) => matchesArchiveVoterType(vote.citizenType, voterType))
    .sort((a, b) => {
      const comparison =
        sort === "block_number"
          ? compareBigIntLike(a.blockNumber, b.blockNumber)
          : compareBigIntLike(a.weight, b.weight);

      if (comparison !== 0) {
        return comparison * direction;
      }

      return a.address.localeCompare(b.address);
    });
}

export function processArchiveNonVoters(
  nonVoters: ArchiveNonVoter[],
  {
    sort = "weight",
    sortOrder = "desc",
    voterType = "ALL",
  }: ArchiveVotesProcessingOptions
) {
  const direction = sortOrder === "asc" ? 1 : -1;

  return nonVoters
    .filter((nonVoter) =>
      matchesArchiveVoterType(nonVoter.citizen_type, voterType)
    )
    .sort((a, b) => {
      const comparison =
        sort === "block_number"
          ? a.delegate.localeCompare(b.delegate)
          : compareBigIntLike(a.voting_power, b.voting_power);

      if (comparison !== 0) {
        return comparison * direction;
      }

      return a.delegate.localeCompare(b.delegate);
    });
}

function transformArchiveNonVoterRows(rows: ArchiveNonVoterRow[]) {
  const seen = new Set<string>();

  return rows.reduce<ArchiveNonVoter[]>((acc, row) => {
    const address = row.addr?.toLowerCase();
    const citizenType = row.citizen_type ?? "";
    const dedupeKey = `${citizenType}:${address}`;

    if (!address || seen.has(dedupeKey)) {
      return acc;
    }

    seen.add(dedupeKey);

    acc.push({
      delegate: address,
      voting_power: row.vp !== undefined ? String(row.vp) : "0",
      twitter: row.x ?? null,
      warpcast: row.warpcast ?? null,
      discord: row.discord ?? null,
      citizen_type: row.citizen_type ?? null,
      voterMetadata:
        row.name || row.ens
          ? {
              name: row.name || row.ens || "",
              image: row.image || "",
              type: row.citizen_type || "",
            }
          : null,
    } satisfies ArchiveNonVoter);

    return acc;
  }, []);
}

/**
 * Fetch and transform archive votes
 */
async function fetchArchiveVotes({
  proposalId,
  proposalType,
  startBlock,
}: {
  proposalId: string;
  proposalType: ProposalType;
  startBlock: bigint | number | null;
}): Promise<ArchiveVote[]> {
  const response = await fetch(`/api/archive/votes/${proposalId}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const payload = (await response.json()) as {
    data?: ArchiveVoteRow[];
  };

  // Transform raw data using proposal details
  const startBlockString =
    startBlock !== undefined && startBlock !== null
      ? typeof startBlock === "bigint"
        ? startBlock.toString()
        : String(startBlock)
      : null;

  const votes =
    payload.data?.map((row) => {
      const support =
        row.support === null
          ? null
          : parseSupport(row.support ?? null, proposalType, startBlockString);
      const vp = row.weight !== undefined ? String(row.weight) : undefined;
      const vpForCopelanProposalType =
        row.vp !== undefined ? String(row.vp) : undefined;

      return {
        transactionHash: row.transaction_hash ?? null,
        address: row.voter?.toLowerCase(),
        support,
        weight: vp || vpForCopelanProposalType || "0",
        citizenType: row.citizen_type ?? null,
        voterMetadata:
          row.name || row.ens
            ? {
                name: row.name || row.ens || "",
                image: row.image ?? null,
                type: row.citizen_type || "",
              }
            : null,
        proposalId,
        proposalType,
        reason: row.reason ?? null,
        params: row.params || row.choice || null,
        blockNumber: row.block_number,
        timestamp: row.ts ? new Date(Number(row.ts)) : null,
      } satisfies ArchiveVote;
    }) ?? [];

  return votes;
}

export function useArchiveVotes({
  proposalId,
  proposalType,
  startBlock,
  sort = "weight", // Default to weight
  sortOrder = "desc", // Default to desc
  voterType = "ALL",
}: {
  proposalId: string;
  proposalType: ProposalType;
  startBlock: bigint | number | null;
  sort?: VotesSort;
  sortOrder?: VotesSortOrder;
  voterType?: VoterTypes["type"];
}) {
  const startBlockString =
    startBlock !== undefined && startBlock !== null
      ? typeof startBlock === "bigint"
        ? startBlock.toString()
        : String(startBlock)
      : null;

  const { data, isLoading, error } = useQuery({
    queryKey: [ARCHIVE_VOTES_QK, proposalId, proposalType, startBlockString],
    queryFn: () => fetchArchiveVotes({ proposalId, proposalType, startBlock }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  const processedVotes = useMemo(() => {
    if (!data) return [];

    return processArchiveVotes(data, { sort, sortOrder, voterType });
  }, [data, sort, sortOrder, voterType]);

  return {
    votes: processedVotes,
    isLoading,
    error: error ? (error as Error).message : null,
  };
}

/**
 * Fetch and transform archive non-voters
 */
async function fetchArchiveNonVoters({
  proposalId,
}: {
  proposalId: string;
}): Promise<ArchiveNonVoter[]> {
  const response = await fetch(`/api/archive/non-voters/${proposalId}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const payload = (await response.json()) as {
    data?: ArchiveNonVoterRow[];
  };

  return transformArchiveNonVoterRows(payload.data ?? []);
}

export function useArchiveNonVoters({
  proposalId,
  sort = "weight",
  sortOrder = "desc",
  voterType = "ALL",
}: {
  proposalId: string;
  sort?: VotesSort;
  sortOrder?: VotesSortOrder;
  voterType?: VoterTypes["type"];
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: [ARCHIVE_NON_VOTERS_QK, proposalId],
    queryFn: () => fetchArchiveNonVoters({ proposalId }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  const processedNonVoters = useMemo(() => {
    if (!data) return [];

    return processArchiveNonVoters(data, { sort, sortOrder, voterType });
  }, [data, sort, sortOrder, voterType]);

  return {
    nonVoters: processedNonVoters,
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
