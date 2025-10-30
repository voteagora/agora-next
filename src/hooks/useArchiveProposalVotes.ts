import { useQuery } from "@tanstack/react-query";
import type { ProposalType } from "@/lib/types";
import type { ArchiveVoteRow, ArchiveNonVoterRow } from "@/lib/archiveUtils";
import { parseSupport } from "@/lib/voteUtils";

export type ArchiveVote = {
  transactionHash: string | null;
  address: string;
  support: "AGAINST" | "ABSTAIN" | "FOR";
  weight: string;
  citizenType: string | null;
  voterMetadata: null;
  proposalId: string;
  proposalType: ProposalType;
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

  return (
    payload.data?.map((row) => {
      const support = parseSupport(
        row.support ?? null,
        proposalType,
        startBlockString
      );

      return {
        transactionHash: row.transaction_hash ?? null,
        address: row.voter?.toLowerCase(),
        support,
        weight: row.weight !== undefined ? String(row.weight) : "0",
        citizenType: null,
        voterMetadata: null,
        proposalId,
        proposalType,
      };
    }) ?? []
  );
}

/**
 * Custom hook to fetch and transform archive votes using TanStack Query
 */
export function useArchiveVotes({
  proposalId,
  proposalType,
  startBlock,
}: {
  proposalId: string;
  proposalType: ProposalType;
  startBlock: bigint | number | null;
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

  return {
    votes: data ?? [],
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

  // Transform raw data on client side and deduplicate
  const seen = new Set<string>();
  return (
    payload.data?.reduce<ArchiveNonVoter[]>((acc, row) => {
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
    }, []) ?? []
  );
}

/**
 * Custom hook to fetch and transform archive non-voters using TanStack Query
 */
export function useArchiveNonVoters({ proposalId }: { proposalId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: [ARCHIVE_NON_VOTERS_QK, proposalId],
    queryFn: () => fetchArchiveNonVoters({ proposalId }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  return {
    nonVoters: data ?? [],
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
