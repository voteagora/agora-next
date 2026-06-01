import type { VotesSort, VotesSortOrder } from "@/app/api/common/votes/vote";
import {
  fetchProposalFromArchive,
  fetchProposalsFromArchive,
  fetchRawProposalVotesFromArchive,
} from "@/lib/archiveUtils";
import {
  processArchiveVotes,
  transformArchiveVoteRows,
  type ArchiveVote,
} from "@/lib/archiveVoteHistory";
import type { ProposalType } from "@/lib/types";
import {
  deriveProposalType,
  type ArchiveListProposal,
} from "@/lib/types/archiveProposal";
import Tenant from "@/lib/tenant/tenant";
import { parseSupport } from "@/lib/voteUtils";

export type ArchiveProposalResponse = ArchiveListProposal & {
  derivedProposalType: ProposalType | null;
};

export type ArchiveVoteResponse = Omit<
  ArchiveVote,
  "blockNumber" | "timestamp"
> & {
  blockNumber: string | null;
  timestamp: string | null;
};

export type ArchiveListResponse<T> = {
  data: T[];
};

function enrichArchiveProposal(
  proposal: ArchiveListProposal
): ArchiveProposalResponse {
  try {
    return {
      ...proposal,
      derivedProposalType: deriveProposalType(proposal),
    };
  } catch {
    return {
      ...proposal,
      derivedProposalType: null,
    };
  }
}

function serializeArchiveVote(vote: ArchiveVote): ArchiveVoteResponse {
  return {
    ...vote,
    blockNumber: vote.blockNumber?.toString() ?? null,
    timestamp: vote.timestamp?.toISOString() ?? null,
  };
}

export async function getArchiveProposals({
  filter,
}: {
  filter: string;
}): Promise<ArchiveListResponse<ArchiveProposalResponse>> {
  const { namespace } = Tenant.current();
  const proposalsResult = await fetchProposalsFromArchive(namespace, filter);
  const proposals = proposalsResult.data.map(enrichArchiveProposal);

  return { data: proposals };
}

export async function getArchiveProposal(
  proposalId: string
): Promise<ArchiveProposalResponse | null> {
  const { namespace } = Tenant.current();
  const proposal = await fetchProposalFromArchive(namespace, proposalId);

  return proposal ? enrichArchiveProposal(proposal) : null;
}

export async function getArchiveProposalVotes({
  proposalId,
  sort,
  sortOrder,
}: {
  proposalId: string;
  sort: VotesSort;
  sortOrder: VotesSortOrder;
}): Promise<ArchiveListResponse<ArchiveVoteResponse> | null> {
  const { namespace, token } = Tenant.current();
  const proposal = await fetchProposalFromArchive(namespace, proposalId);

  if (!proposal) {
    return null;
  }

  const proposalType = deriveProposalType(proposal);
  const rawVotes = await fetchRawProposalVotesFromArchive({
    namespace,
    proposalId,
  });
  const votes = transformArchiveVoteRows(rawVotes, {
    parseSupport,
    proposalId,
    proposalType,
    startBlock: proposal.start_block,
  });
  const processedVotes = processArchiveVotes(votes, {
    sort,
    sortOrder,
    voterType: "ALL",
    tokenDecimals: token.decimals,
  });
  const serializedVotes = processedVotes.map(serializeArchiveVote);

  return { data: serializedVotes };
}
