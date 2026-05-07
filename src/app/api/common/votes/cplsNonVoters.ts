import type { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import { TENANT_NAMESPACES } from "@/lib/constants";
import type { ArchiveNonVoterRow } from "@/lib/archiveUtils";
import type { VoterTypes, VotesSort, VotesSortOrder } from "./vote";

export const CPLS_SNAPSHOT_VOTING_POWER_SOURCE = "cpls_snapshot";

export type CplsSnapshotNonVoter = {
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
  votingPowerSource: typeof CPLS_SNAPSHOT_VOTING_POWER_SOURCE;
};

function parseVotingPower(votingPower: string): bigint {
  try {
    return BigInt(votingPower);
  } catch {
    return 0n;
  }
}

function compareVotingPower(a: CplsSnapshotNonVoter, b: CplsSnapshotNonVoter) {
  const aVotingPower = parseVotingPower(a.voting_power);
  const bVotingPower = parseVotingPower(b.voting_power);

  if (aVotingPower === bVotingPower) {
    return 0;
  }

  return aVotingPower < bVotingPower ? -1 : 1;
}

function rowMatchesVoterType({
  namespace,
  row,
  type,
}: {
  namespace: string;
  row: CplsSnapshotNonVoter;
  type: VoterTypes["type"];
}) {
  if (namespace !== TENANT_NAMESPACES.OPTIMISM) {
    return true;
  }

  const citizenType = row.citizen_type?.toUpperCase();
  const selectedType = type.toUpperCase();

  if (selectedType === "ALL") {
    return true;
  }

  if (selectedType === "TH") {
    return !citizenType;
  }

  if (selectedType === "CH") {
    return !!citizenType;
  }

  return citizenType === selectedType;
}

function paginateCplsNonVoters(
  nonVoters: CplsSnapshotNonVoter[],
  pagination: PaginationParams
): PaginatedResult<CplsSnapshotNonVoter[]> {
  if (pagination.limit <= 0 || pagination.offset < 0) {
    throw new Error(
      "Limit must be greater than 0 and offset must be non-negative"
    );
  }

  const page = nonVoters.slice(
    pagination.offset,
    pagination.offset + pagination.limit + 1
  );
  const has_next = page.length > pagination.limit;
  const data = page.slice(0, pagination.limit);

  return {
    meta: {
      has_next,
      total_returned: data.length,
      next_offset: has_next ? pagination.offset + pagination.limit : 0,
    },
    data,
  };
}

export function buildCplsSnapshotNonVotersResult({
  namespace,
  pagination,
  rows,
  sort = "weight",
  sortOrder = "desc",
  type = "TH",
}: {
  namespace: string;
  pagination: PaginationParams;
  rows: ArchiveNonVoterRow[];
  sort?: VotesSort;
  sortOrder?: VotesSortOrder;
  type?: VoterTypes["type"];
}): PaginatedResult<CplsSnapshotNonVoter[]> {
  const seen = new Set<string>();

  const nonVoters = rows.reduce<CplsSnapshotNonVoter[]>((acc, row) => {
    const address = row.addr?.toLowerCase();
    const citizenType = row.citizen_type ?? null;
    const dedupeKey = `${citizenType ?? ""}:${address}`;

    if (!address || seen.has(dedupeKey)) {
      return acc;
    }

    seen.add(dedupeKey);

    const nonVoter: CplsSnapshotNonVoter = {
      delegate: address,
      voting_power: row.vp !== undefined ? String(row.vp) : "0",
      twitter: row.x ?? null,
      warpcast: row.warpcast ?? null,
      discord: row.discord ?? null,
      citizen_type: citizenType,
      voterMetadata:
        row.name || row.ens
          ? {
              name: row.name || row.ens || "",
              image: row.image || "",
              type: citizenType || "",
            }
          : null,
      votingPowerSource: CPLS_SNAPSHOT_VOTING_POWER_SOURCE,
    };

    if (!rowMatchesVoterType({ namespace, row: nonVoter, type })) {
      return acc;
    }

    acc.push(nonVoter);
    return acc;
  }, []);

  const direction = sortOrder === "asc" ? 1 : -1;

  nonVoters.sort((a, b) => {
    const comparison =
      sort === "block_number"
        ? a.delegate.localeCompare(b.delegate)
        : compareVotingPower(a, b);

    if (comparison !== 0) {
      return comparison * direction;
    }

    return a.delegate.localeCompare(b.delegate);
  });

  return paginateCplsNonVoters(nonVoters, pagination);
}
