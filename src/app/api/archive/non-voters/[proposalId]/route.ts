import { type NextRequest, NextResponse } from "next/server";
import Tenant from "@/lib/tenant/tenant";
import { fetchRawProposalNonVotersFromArchive } from "@/lib/archiveUtils";
import type {
  VotesSort,
  VotesSortOrder,
  VoterTypes,
} from "@/app/api/common/votes/vote";
import {
  buildArchiveNonVotersResult,
  DEFAULT_ARCHIVE_TOKEN_DECIMALS,
  transformArchiveNonVoterRows,
} from "@/lib/archiveVoteHistory";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 250;

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
      Tenant.current().token.decimals ?? DEFAULT_ARCHIVE_TOKEN_DECIMALS;

    const transformedNonVoters = transformArchiveNonVoterRows(rawNonVoters);
    return NextResponse.json(
      buildArchiveNonVotersResult({
        nonVoters: transformedNonVoters,
        pagination: { limit, offset },
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
