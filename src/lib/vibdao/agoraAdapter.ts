import type { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import type { Proposal } from "@/app/api/common/proposals/proposal";
import type {
  Delegate,
  DelegateChunk,
} from "@/app/api/common/delegates/delegate";
import type { Vote, VotesSort } from "@/app/api/common/votes/vote";
import type { ProposalRecord, VoteRecord } from "@/lib/vibdao/types";
import { getAddress, isAddress } from "viem";
import {
  getAddressClaims,
  getAddressDonations,
  getDashboardSummary,
  getFellows,
  getProposalById,
  getProposals,
} from "@/lib/vibdao/data";

type ProposalStatus =
  | "CANCELLED"
  | "SUCCEEDED"
  | "DEFEATED"
  | "ACTIVE"
  | "FAILED"
  | "PENDING"
  | "QUEUED"
  | "EXECUTED"
  | "CLOSED"
  | "PASSED";

const DEFAULT_LIMIT = 10;

export function isVibdaoLocalMode(): boolean {
  return process.env.VIBDAO_LOCAL_MODE === "true";
}

function paginateArray<T>(
  items: T[],
  pagination: PaginationParams = { limit: DEFAULT_LIMIT, offset: 0 }
): PaginatedResult<T[]> {
  const { limit, offset } = pagination;
  const page = items.slice(offset, offset + limit);

  return {
    meta: {
      has_next: offset + limit < items.length,
      total_returned: page.length,
      next_offset: offset + page.length,
    },
    data: page,
  };
}

function toDateFromSeconds(value: string | null | undefined): Date | null {
  if (!value) return null;
  const seconds = Number(value);
  if (!Number.isFinite(seconds)) return null;
  return new Date(seconds * 1000);
}

function mapProposalStatus(state: string): ProposalStatus {
  switch (state.toLowerCase()) {
    case "active":
      return "ACTIVE";
    case "queued":
      return "QUEUED";
    case "executed":
      return "EXECUTED";
    case "succeeded":
      return "SUCCEEDED";
    case "defeated":
      return "DEFEATED";
    case "cancelled":
      return "CANCELLED";
    case "expired":
      return "FAILED";
    default:
      return "PENDING";
  }
}

function getProposalTitle(proposal: ProposalRecord): string {
  const fromMetadata = proposal.metadata?.title?.trim();
  if (fromMetadata) return fromMetadata;

  const fromDescription = proposal.description?.trim();
  if (fromDescription) return fromDescription;

  return `VibDAO Proposal #${proposal.proposalId}`;
}

function getProposalDescription(proposal: ProposalRecord): string {
  return (
    proposal.metadata?.body ??
    proposal.metadata?.summary ??
    proposal.description ??
    ""
  );
}

function buildFunctionArgsName(proposal: ProposalRecord) {
  return proposal.actions.map((action) => ({
    functionName: action.actionType,
    functionArgs: [action.recipient, action.member, action.amount, action.monthlySalary]
      .filter((value): value is string => Boolean(value)),
  }));
}

function estimateEndTime(proposal: ProposalRecord): Date | null {
  const createdAt = toDateFromSeconds(proposal.createdTimestamp);
  const createdBlock = Number(proposal.createdBlock);
  const deadlineBlock = Number(proposal.deadlineBlock);

  if (!createdAt || !Number.isFinite(createdBlock) || !Number.isFinite(deadlineBlock)) {
    return createdAt;
  }

  const blockDelta = Math.max(deadlineBlock - createdBlock, 0);
  return new Date(createdAt.getTime() + blockDelta * 12_000);
}

function adaptProposal(proposal: ProposalRecord): Proposal {
  const description = getProposalDescription(proposal);

  return {
    id: proposal.proposalId,
    proposer: proposal.proposer,
    snapshotBlockNumber: Number(proposal.snapshotBlock),
    createdTime: toDateFromSeconds(proposal.createdTimestamp),
    startTime: toDateFromSeconds(proposal.createdTimestamp),
    startBlock: proposal.snapshotBlock,
    endTime: estimateEndTime(proposal),
    endBlock: proposal.deadlineBlock,
    cancelledTime: null,
    executedTime: toDateFromSeconds(proposal.executedAt),
    executedBlock: proposal.executedAt,
    queuedTime: toDateFromSeconds(proposal.queuedAt),
    markdowntitle: getProposalTitle(proposal),
    description,
    quorum: proposal.quorumVotes ? BigInt(proposal.quorumVotes) : null,
    votableSupply: null,
    approvalThreshold: null,
    proposalData: {
      options: [
        {
          targets: [proposal.target],
          values: [proposal.value],
          signatures: [proposal.proposalType],
          calldatas: [proposal.calldata],
          functionArgsName: buildFunctionArgsName(proposal),
        },
      ],
      calculationOptions: 0,
    },
    unformattedProposalData: proposal.calldata as `0x${string}`,
    proposalResults: {
      for: BigInt(proposal.forVotes),
      against: BigInt(proposal.againstVotes),
      abstain: BigInt(proposal.abstainVotes),
      decimals: 18,
    } as any,
    proposalType: "STANDARD",
    proposalTypeData: null,
    status: mapProposalStatus(proposal.state),
    createdTransactionHash: null,
    cancelledTransactionHash: null,
    queuedTransactionHash: null,
    executedTransactionHash: null,
    offchainProposalId: undefined,
    proposalTypeApproval: undefined,
    kwargs: {
      vibdaoProposalType: proposal.proposalType,
    },
    taxFormMetadata: undefined,
  };
}

function mapVoteSupport(support: number): "AGAINST" | "FOR" | "ABSTAIN" {
  if (support === 1) return "FOR";
  if (support === 0) return "AGAINST";
  return "ABSTAIN";
}

function adaptVote(vote: VoteRecord, proposal: ProposalRecord): Vote {
  return {
    transactionHash: vote.txHash,
    address: vote.voter.toLowerCase(),
    proposalId: vote.proposalId,
    support: mapVoteSupport(vote.support),
    weight: BigInt(vote.weight).toString(),
    reason: vote.reason,
    params: null,
    proposalValue: BigInt(proposal.value || "0"),
    proposalTitle: getProposalTitle(proposal),
    proposalType: "STANDARD",
    timestamp: toDateFromSeconds(vote.blockTimestamp),
    blockNumber: BigInt(vote.blockNumber),
    citizenType: null,
    voterMetadata: null,
    easOodaoMetadata: null,
  };
}

function buildDelegateStatement(
  address: string,
  proposalsCreated: number,
  proposalsVotedOn: number,
  activeFellow: boolean
) {
  return {
    created_at: new Date(0),
    updated_at: new Date(0),
    twitter: null,
    discord: null,
    warpcast: null,
    signature: "",
    endorsed: activeFellow,
    scw_address: null,
    notification_preferences: {
      wants_proposal_created_email: false,
      wants_proposal_ending_soon_email: false,
      last_updated_at: new Date(0),
    },
    payload: {
      delegateStatement: activeFellow
        ? `Active VibDAO fellow at ${address}.`
        : `Local VibDAO participant with ${proposalsCreated} proposals created and ${proposalsVotedOn} votes cast.`,
      topIssues: [],
      topStakeholders: [],
    },
  } as any;
}

function buildFallbackDelegate(address: string): Delegate {
  return {
    address,
    citizen: false,
    votingPower: {
      total: "0",
      direct: "0",
      advanced: "0",
    },
    votingPowerRelativeToVotableSupply: 0,
    votingPowerRelativeToQuorum: 0,
    proposalsCreated: 0n,
    proposalsVotedOn: 0n,
    votedFor: "0",
    votedAgainst: "0",
    votedAbstain: "0",
    votingParticipation: 0,
    lastTenProps: "0",
    totalProposals: 0,
    numOfDelegators: 0n,
    statement: buildDelegateStatement(address, 0, 0, false),
    relativeVotingPowerToVotableSupply: "0.00",
    vpChange7d: 0n,
    participation: 0,
  } as Delegate;
}

async function buildDelegates(): Promise<Delegate[]> {
  const [proposals, fellows] = await Promise.all([getProposals(200), getFellows()]);
  const addresses = new Set<string>();

  for (const proposal of proposals) {
    addresses.add(proposal.proposer.toLowerCase());
    for (const vote of proposal.votes) {
      addresses.add(vote.voter.toLowerCase());
    }
  }
  for (const fellow of fellows) {
    addresses.add(fellow.member.toLowerCase());
  }

  const summary = await getDashboardSummary();
  const totalSupply = BigInt(summary.totalDonated || "0");
  const totalProposals = proposals.length;

  const delegates = await Promise.all(
    [...addresses].map(async (address) => {
      const [donations, claims] = await Promise.all([
        getAddressDonations(address),
        getAddressClaims(address),
      ]);

      const relatedProposals = proposals.filter(
        (proposal) => proposal.proposer.toLowerCase() === address
      );
      const relatedVotes = proposals.flatMap((proposal) =>
        proposal.votes.filter((vote) => vote.voter.toLowerCase() === address)
      );
      const activeFellow = fellows.some(
        (fellow) => fellow.member.toLowerCase() === address && fellow.active
      );

      const directVotingPower = donations.reduce((sum, donation) => {
        const isBeneficiary = donation.beneficiary.toLowerCase() === address;
        const isDonor = donation.donor.toLowerCase() === address;
        return sum + BigInt(isBeneficiary || isDonor ? donation.votingPower : "0");
      }, 0n);

      const votedFor = relatedVotes.filter((vote) => vote.support === 1).length;
      const votedAgainst = relatedVotes.filter((vote) => vote.support === 0).length;
      const votedAbstain = relatedVotes.filter((vote) => vote.support !== 1 && vote.support !== 0).length;
      const participation =
        totalProposals > 0 ? (relatedVotes.length / totalProposals) * 100 : 0;

      return {
        address,
        citizen: false,
        votingPower: {
          total: directVotingPower.toString(),
          direct: directVotingPower.toString(),
          advanced: "0",
        },
        votingPowerRelativeToVotableSupply:
          totalSupply > 0n ? Number((directVotingPower * 10_000n) / totalSupply) / 10_000 : 0,
        votingPowerRelativeToQuorum: 0,
        proposalsCreated: BigInt(relatedProposals.length),
        proposalsVotedOn: BigInt(relatedVotes.length),
        votedFor: String(votedFor),
        votedAgainst: String(votedAgainst),
        votedAbstain: String(votedAbstain),
        votingParticipation: participation,
        lastTenProps: String(Math.min(relatedVotes.length, 10)),
        totalProposals,
        numOfDelegators: BigInt(
          new Set(
            donations
              .filter((donation) => donation.beneficiary.toLowerCase() === address)
              .map((donation) => donation.donor.toLowerCase())
          ).size
        ),
        statement: buildDelegateStatement(
          address,
          relatedProposals.length,
          relatedVotes.length,
          activeFellow
        ),
        relativeVotingPowerToVotableSupply:
          totalSupply > 0n ? ((Number(directVotingPower) / Number(totalSupply)) * 100).toFixed(2) : "0.00",
        vpChange7d: 0n,
        participation,
        claimsCount: claims.length,
      } as Delegate;
    })
  );

  return delegates.sort(
    (a, b) => Number(BigInt(b.votingPower.total) - BigInt(a.votingPower.total))
  );
}

export async function getLocalAgoraDelegates(args: {
  pagination?: PaginationParams;
  sort: string;
}): Promise<PaginatedResult<DelegateChunk[]>> {
  const delegates = await buildDelegates();
  const sorted = [...delegates];

  if (args.sort === "least_voting_power") {
    sorted.reverse();
  }

  return paginateArray(
    sorted.map((delegate) => ({
      address: delegate.address,
      votingPower: delegate.votingPower,
      statement: delegate.statement,
      participation: delegate.participation,
    })),
    args.pagination
  );
}

export async function getLocalAgoraDelegate(
  addressOrEnsName: string
): Promise<Delegate | null> {
  const delegates = await buildDelegates();
  const address = addressOrEnsName.toLowerCase();
  const matched =
    delegates.find((delegate) => delegate.address === address) ?? null;

  if (matched) {
    return matched;
  }

  if (isAddress(addressOrEnsName)) {
    return buildFallbackDelegate(getAddress(addressOrEnsName).toLowerCase());
  }

  return null;
}

export async function getLocalAgoraProposals(args: {
  pagination?: PaginationParams;
  filter: string;
}): Promise<PaginatedResult<Proposal[]>> {
  const proposals = await getProposals(200);
  const filtered =
    args.filter === "relevant"
      ? proposals.filter((proposal) => proposal.state.toLowerCase() !== "cancelled")
      : proposals;

  return paginateArray(filtered.map(adaptProposal), args.pagination);
}

export async function getLocalAgoraProposal(
  proposalId: string
): Promise<Proposal> {
  const proposal = await getProposalById(proposalId);
  if (!proposal) {
    throw new Error(`Proposal ${proposalId} not found`);
  }
  return adaptProposal(proposal);
}

export async function getLocalAgoraVotesForProposal(args: {
  proposalId: string;
  pagination?: PaginationParams;
  sort?: VotesSort;
}): Promise<PaginatedResult<Vote[]>> {
  const proposal = await getProposalById(args.proposalId);
  if (!proposal) {
    return paginateArray([], args.pagination);
  }

  const votes = proposal.votes.map((vote) => adaptVote(vote, proposal));
  const sorted = [...votes].sort((a, b) => {
    if (args.sort === "block_number") {
      return Number((b.blockNumber ?? 0n) - (a.blockNumber ?? 0n));
    }
    return Number(BigInt(b.weight) - BigInt(a.weight));
  });

  return paginateArray(sorted, args.pagination);
}

export async function getLocalAgoraUserVotesForProposal(args: {
  proposalId: string;
  address: string;
}): Promise<Vote[]> {
  const proposal = await getProposalById(args.proposalId);
  if (!proposal) return [];

  return proposal.votes
    .filter((vote) => vote.voter.toLowerCase() === args.address.toLowerCase())
    .map((vote) => adaptVote(vote, proposal));
}

export async function getLocalAgoraVotableSupply(): Promise<string> {
  const summary = await getDashboardSummary();
  return summary.totalDonated || "1";
}
