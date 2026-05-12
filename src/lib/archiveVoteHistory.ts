import type { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import type {
  VotesSort,
  VotesSortOrder,
  VoterTypes,
} from "@/app/api/common/votes/vote";
import type { ProposalType } from "@/lib/types";
import type { ArchiveNonVoterRow, ArchiveVoteRow } from "@/lib/archiveUtils";
import type { Support } from "@/lib/voteUtils";

export type ArchiveVote = {
  transactionHash: string | null;
  address: string;
  support: Support | null;
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
  blockNumber: bigint | null;
  timestamp: Date | null;
};

export type ArchiveVotingPowerSource = "cpls_snapshot";

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
  votingPowerSource?: ArchiveVotingPowerSource;
};

type ArchiveVotesProcessingOptions = {
  sort?: VotesSort;
  sortOrder?: VotesSortOrder;
  voterType?: VoterTypes["type"];
  tokenDecimals?: number;
};

type ParseArchiveSupport = (
  support: string | null,
  proposalType: ProposalType,
  startBlock: string | null
) => Support;

export const DEFAULT_ARCHIVE_TOKEN_DECIMALS = 18;

function parseComparableBigInt(
  value: string | number | bigint | null | undefined
) {
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

function parseNullableBigInt(
  value: string | number | bigint | null | undefined
) {
  if (value === undefined || value === null) {
    return null;
  }

  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

function getTokenScale(tokenDecimals = DEFAULT_ARCHIVE_TOKEN_DECIMALS) {
  return 10n ** BigInt(Math.max(0, Math.trunc(tokenDecimals)));
}

function parseUnitAmountToBaseUnits(
  value: string | number | bigint | null | undefined,
  tokenDecimals = DEFAULT_ARCHIVE_TOKEN_DECIMALS
) {
  const scale = getTokenScale(tokenDecimals);

  if (typeof value === "bigint") {
    return value * scale;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return 0n;
    }

    return BigInt(Math.trunc(value * Number(scale)));
  }

  if (typeof value !== "string") {
    return 0n;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return 0n;
  }

  if (trimmedValue.includes("e") || trimmedValue.includes("E")) {
    const parsedValue = Number(trimmedValue);
    return Number.isFinite(parsedValue)
      ? BigInt(Math.trunc(parsedValue * Number(scale)))
      : 0n;
  }

  const [wholePartRaw, fractionalPartRaw = ""] = trimmedValue.split(".");
  const wholePart = wholePartRaw || "0";
  const fractionalPart = fractionalPartRaw
    .slice(0, tokenDecimals)
    .padEnd(tokenDecimals, "0");

  try {
    return BigInt(wholePart) * scale + BigInt(fractionalPart || "0");
  } catch {
    return 0n;
  }
}

function getArchiveVotingPowerSortValue(
  value: string | number | bigint | null | undefined,
  citizenType: string | null | undefined,
  tokenDecimals = DEFAULT_ARCHIVE_TOKEN_DECIMALS
) {
  return citizenType
    ? parseUnitAmountToBaseUnits(value, tokenDecimals)
    : parseComparableBigInt(value);
}

function compareArchiveVotingPower(
  aValue: string | number | bigint | null | undefined,
  aCitizenType: string | null | undefined,
  bValue: string | number | bigint | null | undefined,
  bCitizenType: string | null | undefined,
  tokenDecimals = DEFAULT_ARCHIVE_TOKEN_DECIMALS
) {
  const aPower = getArchiveVotingPowerSortValue(
    aValue,
    aCitizenType,
    tokenDecimals
  );
  const bPower = getArchiveVotingPowerSortValue(
    bValue,
    bCitizenType,
    tokenDecimals
  );

  if (aPower === bPower) {
    return 0;
  }

  return aPower < bPower ? -1 : 1;
}

function getArchiveHouseOrder(
  citizenType: string | null | undefined,
  sortOrder: VotesSortOrder
) {
  const isCitizenHouse = !!citizenType;
  if (sortOrder === "asc") {
    return isCitizenHouse ? 0 : 1;
  }

  return isCitizenHouse ? 1 : 0;
}

function hasArchiveTemporalValue(
  vote: Pick<ArchiveVote, "blockNumber" | "timestamp">
) {
  return vote.blockNumber !== undefined && vote.blockNumber !== null
    ? true
    : !!vote.timestamp;
}

export function canArchiveVotesSortByTime(votes: ArchiveVote[]) {
  return votes.some(hasArchiveTemporalValue);
}

function getArchiveTemporalSortValue(vote: ArchiveVote) {
  if (vote.blockNumber !== undefined && vote.blockNumber !== null) {
    return parseComparableBigInt(vote.blockNumber);
  }

  const timestamp = vote.timestamp?.getTime();
  if (timestamp !== undefined && Number.isFinite(timestamp)) {
    return BigInt(timestamp);
  }

  return null;
}

function compareArchiveTemporalVotes(
  a: { vote: ArchiveVote; index: number },
  b: { vote: ArchiveVote; index: number },
  direction: number
) {
  const aValue = getArchiveTemporalSortValue(a.vote);
  const bValue = getArchiveTemporalSortValue(b.vote);

  if (aValue !== null && bValue !== null && aValue !== bValue) {
    return (aValue < bValue ? -1 : 1) * direction;
  }

  return a.index - b.index;
}

function sortArchiveVotesByTime(votes: ArchiveVote[], direction: number) {
  const indexedVotes = votes.map((vote, index) => ({ vote, index }));
  const temporalVotes = indexedVotes.filter(({ vote }) =>
    hasArchiveTemporalValue(vote)
  );

  if (!temporalVotes.length) {
    return votes;
  }

  const sortedTemporalVotes = [...temporalVotes].sort((a, b) =>
    compareArchiveTemporalVotes(a, b, direction)
  );

  if (temporalVotes.length === indexedVotes.length) {
    return sortedTemporalVotes.map(({ vote }) => vote);
  }

  let temporalIndex = 0;
  return indexedVotes.map(({ vote }) => {
    if (!hasArchiveTemporalValue(vote)) {
      return vote;
    }

    return sortedTemporalVotes[temporalIndex++].vote;
  });
}

export function matchesArchiveVoterType(
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
    tokenDecimals = DEFAULT_ARCHIVE_TOKEN_DECIMALS,
  }: ArchiveVotesProcessingOptions
) {
  const direction = sortOrder === "asc" ? 1 : -1;
  const shouldUseHouseTieBreaker = voterType === "ALL" && sort === "weight";

  const filteredVotes = votes.filter((vote) =>
    matchesArchiveVoterType(vote.citizenType, voterType)
  );

  if (sort === "block_number") {
    return sortArchiveVotesByTime(filteredVotes, direction);
  }

  return [...filteredVotes].sort((a, b) => {
    const comparison = compareArchiveVotingPower(
      a.weight,
      a.citizenType,
      b.weight,
      b.citizenType,
      tokenDecimals
    );

    if (comparison !== 0) {
      return comparison * direction;
    }

    if (shouldUseHouseTieBreaker) {
      const houseComparison =
        getArchiveHouseOrder(a.citizenType, sortOrder) -
        getArchiveHouseOrder(b.citizenType, sortOrder);

      if (houseComparison !== 0) {
        return houseComparison;
      }
    }

    return a.address.localeCompare(b.address);
  });
}

export function processArchiveNonVoters<TArchiveNonVoter extends ArchiveNonVoter>(
  nonVoters: TArchiveNonVoter[],
  {
    sort = "weight",
    sortOrder = "desc",
    voterType = "ALL",
    tokenDecimals = DEFAULT_ARCHIVE_TOKEN_DECIMALS,
  }: ArchiveVotesProcessingOptions
) {
  const direction = sortOrder === "asc" ? 1 : -1;
  const shouldUseHouseTieBreaker = voterType === "ALL" && sort === "weight";

  return nonVoters
    .filter((nonVoter) =>
      matchesArchiveVoterType(nonVoter.citizen_type, voterType)
    )
    .sort((a, b) => {
      const comparison =
        sort === "block_number"
          ? a.delegate.localeCompare(b.delegate)
          : compareArchiveVotingPower(
              a.voting_power,
              a.citizen_type,
              b.voting_power,
              b.citizen_type,
              tokenDecimals
            );

      if (comparison !== 0) {
        return comparison * direction;
      }

      if (shouldUseHouseTieBreaker) {
        const houseComparison =
          getArchiveHouseOrder(a.citizen_type, sortOrder) -
          getArchiveHouseOrder(b.citizen_type, sortOrder);

        if (houseComparison !== 0) {
          return houseComparison;
        }
      }

      return a.delegate.localeCompare(b.delegate);
    });
}

export function paginateArchiveRows<T>(
  rows: T[],
  pagination: PaginationParams
): PaginatedResult<T[]> {
  if (pagination.limit <= 0 || pagination.offset < 0) {
    throw new Error(
      "Limit must be greater than 0 and offset must be non-negative"
    );
  }

  const page = rows.slice(
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

export function transformArchiveVoteRows(
  rows: ArchiveVoteRow[],
  {
    parseSupport,
    proposalId,
    proposalType,
    startBlock,
  }: {
    parseSupport: ParseArchiveSupport;
    proposalId: string;
    proposalType: ProposalType;
    startBlock: bigint | number | string | null;
  }
) {
  const startBlockString =
    startBlock !== undefined && startBlock !== null
      ? typeof startBlock === "bigint"
        ? startBlock.toString()
        : String(startBlock)
      : null;

  return rows.reduce<ArchiveVote[]>((acc, row) => {
    const address = row.voter?.toLowerCase();
    if (!address) {
      return acc;
    }

    const support =
      row.support === null
        ? null
        : parseSupport(row.support ?? null, proposalType, startBlockString);
    const vp = row.weight !== undefined ? String(row.weight) : undefined;
    const vpForCopelanProposalType =
      row.vp !== undefined ? String(row.vp) : undefined;

    acc.push({
      transactionHash: row.transaction_hash ?? null,
      address,
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
      blockNumber: parseNullableBigInt(row.block_number),
      timestamp: row.ts ? new Date(Number(row.ts)) : null,
    });

    return acc;
  }, []);
}

export function transformArchiveNonVoterRows<
  TVotingPowerSource extends ArchiveVotingPowerSource | undefined = undefined,
>(
  rows: ArchiveNonVoterRow[],
  options: { votingPowerSource?: TVotingPowerSource } = {}
): Array<
  ArchiveNonVoter &
    (TVotingPowerSource extends string
      ? { votingPowerSource: TVotingPowerSource }
      : object)
> {
  const seen = new Set<string>();

  return rows.reduce<
    Array<
      ArchiveNonVoter &
        (TVotingPowerSource extends string
          ? { votingPowerSource: TVotingPowerSource }
          : object)
    >
  >((acc, row) => {
    const address = row.addr?.toLowerCase();
    const citizenType = row.citizen_type ?? "";
    const dedupeKey = `${citizenType}:${address}`;

    if (!address || seen.has(dedupeKey)) {
      return acc;
    }

    seen.add(dedupeKey);

    const nonVoter: ArchiveNonVoter = {
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
    };

    acc.push({
      ...nonVoter,
      ...(options.votingPowerSource
        ? { votingPowerSource: options.votingPowerSource }
        : {}),
    } as ArchiveNonVoter &
      (TVotingPowerSource extends string
        ? { votingPowerSource: TVotingPowerSource }
        : object));

    return acc;
  }, []);
}

export function buildArchiveNonVotersResult<
  TArchiveNonVoter extends ArchiveNonVoter,
>({
  nonVoters,
  pagination,
  sort = "weight",
  sortOrder = "desc",
  voterType = "ALL",
  tokenDecimals = DEFAULT_ARCHIVE_TOKEN_DECIMALS,
}: {
  nonVoters: TArchiveNonVoter[];
  pagination: PaginationParams;
  sort?: VotesSort;
  sortOrder?: VotesSortOrder;
  voterType?: VoterTypes["type"];
  tokenDecimals?: number;
}): PaginatedResult<TArchiveNonVoter[]> {
  const processedNonVoters = processArchiveNonVoters(nonVoters, {
    sort,
    sortOrder,
    voterType,
    tokenDecimals,
  });

  return paginateArchiveRows(processedNonVoters, pagination);
}
