import type { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import { TENANT_NAMESPACES } from "@/lib/constants";
import type { ArchiveNonVoterRow } from "@/lib/archiveUtils";
import type { VoterTypes, VotesSort, VotesSortOrder } from "./vote";
import {
  buildArchiveNonVotersResult,
  transformArchiveNonVoterRows,
  type ArchiveNonVoter,
} from "@/lib/archiveVoteHistory";

export const CPLS_SNAPSHOT_VOTING_POWER_SOURCE = "cpls_snapshot";

export type CplsSnapshotNonVoter = ArchiveNonVoter & {
  votingPowerSource: typeof CPLS_SNAPSHOT_VOTING_POWER_SOURCE;
};

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
  const nonVoters = transformArchiveNonVoterRows(rows, {
    votingPowerSource: CPLS_SNAPSHOT_VOTING_POWER_SOURCE,
  });
  const voterType = namespace === TENANT_NAMESPACES.OPTIMISM ? type : "ALL";

  return buildArchiveNonVotersResult({
    nonVoters,
    pagination,
    sort,
    sortOrder,
    voterType,
  });
}
