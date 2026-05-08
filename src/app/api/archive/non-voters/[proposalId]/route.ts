import { type NextRequest, NextResponse } from "next/server";
import Tenant from "@/lib/tenant/tenant";
import {
  type ArchiveNonVoterRow,
  fetchRawProposalNonVotersFromArchive,
} from "@/lib/archiveUtils";
import type {
  VotesSort,
  VotesSortOrder,
  VoterTypes,
} from "@/app/api/common/votes/vote";

type ArchiveNonVoter = {
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

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 250;
const DEFAULT_TOKEN_DECIMALS = 18;

function parsePositiveInt(value: string | null, fallback: number) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0
    ? Math.trunc(parsedValue)
    : fallback;
}

function parseOffset(value: string | null) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0
    ? Math.trunc(parsedValue)
    : 0;
}

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

function parseUnitAmountToBaseUnits(
  value: string | number | bigint | undefined,
  tokenDecimals = DEFAULT_TOKEN_DECIMALS
) {
  const scale = 10n ** BigInt(Math.max(0, Math.trunc(tokenDecimals)));

  if (typeof value === "bigint") {
    return value * scale;
  }

  if (typeof value === "number") {
    return Number.isFinite(value)
      ? BigInt(Math.trunc(value * Number(scale)))
      : 0n;
  }

  if (typeof value !== "string") {
    return 0n;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return 0n;
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

function compareVotingPower(
  a: ArchiveNonVoter,
  b: ArchiveNonVoter,
  tokenDecimals: number
) {
  const aPower = a.citizen_type
    ? parseUnitAmountToBaseUnits(a.voting_power, tokenDecimals)
    : parseComparableBigInt(a.voting_power);
  const bPower = b.citizen_type
    ? parseUnitAmountToBaseUnits(b.voting_power, tokenDecimals)
    : parseComparableBigInt(b.voting_power);

  if (aPower !== bPower) {
    return aPower < bPower ? -1 : 1;
  }

  return 0;
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
    });

    return acc;
  }, []);
}

function paginateNonVoters(
  nonVoters: ArchiveNonVoter[],
  {
    limit,
    offset,
    sort,
    sortOrder,
    voterType,
    tokenDecimals,
  }: {
    limit: number;
    offset: number;
    sort: VotesSort;
    sortOrder: VotesSortOrder;
    voterType: VoterTypes["type"];
    tokenDecimals: number;
  }
) {
  const sortedNonVoters = nonVoters
    .filter((nonVoter) =>
      matchesArchiveVoterType(nonVoter.citizen_type, voterType)
    )
    .sort((a, b) => {
      if (sort === "block_number") {
        return (
          a.delegate.localeCompare(b.delegate) * (sortOrder === "asc" ? 1 : -1)
        );
      }

      const powerComparison = compareVotingPower(a, b, tokenDecimals);
      if (powerComparison !== 0) {
        return powerComparison * (sortOrder === "asc" ? 1 : -1);
      }

      const houseComparison =
        getArchiveHouseOrder(a.citizen_type, sortOrder) -
        getArchiveHouseOrder(b.citizen_type, sortOrder);

      if (houseComparison !== 0) {
        return houseComparison;
      }

      return a.delegate.localeCompare(b.delegate);
    });

  const page = sortedNonVoters.slice(offset, offset + limit + 1);
  const hasNext = page.length > limit;
  const data = page.slice(0, limit);

  return {
    meta: {
      has_next: hasNext,
      total_returned: data.length,
      next_offset: hasNext ? offset + limit : 0,
    },
    data,
  };
}

function emptyResponse(request: NextRequest) {
  const hasPagination = new URL(request.url).searchParams.has("limit");
  if (!hasPagination) {
    return NextResponse.json({ data: [] });
  }

  return NextResponse.json({
    meta: {
      has_next: false,
      total_returned: 0,
      next_offset: 0,
    },
    data: [],
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { proposalId: string } }
) {
  const { proposalId } = params;
  if (!proposalId) {
    return NextResponse.json({ error: "Missing proposal id" }, { status: 400 });
  }

  const { namespace } = Tenant.current();

  try {
    // Keep the legacy raw response for callers that have not opted into paging.
    const rawNonVoters = await fetchRawProposalNonVotersFromArchive({
      namespace,
      proposalId,
    });

    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    if (!limitParam) {
      return NextResponse.json({ data: rawNonVoters });
    }

    const limit = Math.min(
      parsePositiveInt(limitParam, DEFAULT_LIMIT),
      MAX_LIMIT
    );
    const offset = parseOffset(url.searchParams.get("offset"));
    const sort = (url.searchParams.get("sort") || "weight") as VotesSort;
    const sortOrder = (url.searchParams.get("sortOrder") ||
      "desc") as VotesSortOrder;
    const voterType = (url.searchParams.get("voterType") ||
      "ALL") as VoterTypes["type"];
    const tokenDecimals =
      Tenant.current().token.decimals ?? DEFAULT_TOKEN_DECIMALS;

    const transformedNonVoters = transformArchiveNonVoterRows(rawNonVoters);
    return NextResponse.json(
      paginateNonVoters(transformedNonVoters, {
        limit,
        offset,
        sort,
        sortOrder,
        voterType,
        tokenDecimals,
      })
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
      return emptyResponse(request);
    }
    console.error("Error fetching archive non-voters:", error);
    return emptyResponse(request);
  }
}
