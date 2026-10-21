import { Prisma } from "@prisma/client";

export type DelegateStatement = {
  address?: string;
  username?: string | null;
  avatar?: string | null;
  dao_slug?: string;
  message_hash?: string;
  signature?: string;
  payload: {
    delegateStatement?: string;
    topIssues?: { type: string; value: string }[];
    topStakeholders?: { type: string; value?: string }[];
    [key: string]: unknown;
  };
  twitter?: string | null;
  warpcast?: string | null;
  discord?: string | null;
  scw_address?: string | null;
  endorsed?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  created_at?: Date | null;
  updated_at?: Date | null;
  created_at_ts?: Date | null;
  updated_at_ts?: Date | null;
  stage?: string | null;
};

export type Delegate = {
  address: string;
  votingPower: {
    total: string;
    direct: string;
    advanced: string;
  };
  votingPowerRelativeToVotableSupply: number;
  votingPowerRelativeToQuorum: number;
  proposalsCreated: bigint;
  proposalsVotedOn: bigint;
  votedFor: string;
  votedAgainst: string;
  votedAbstain: string;
  votingParticipation: number;
  lastTenProps: string;
  totalProposals: number;
  numOfDelegators: bigint;
  statement: DelegateStatement | null;
  relativeVotingPowerToVotableSupply: string;
  vpChange7d: bigint;
  participation: number;
};

export type DelegateChunk = Pick<
  Delegate,
  "address" | "votingPower" | "statement" | "participation"
>;

export type DelegatePayload = Delegate & {
  delegate: string;
  voting_power: number;
};

export type DelegatesGetPayload = {
  delegate: string;
  num_of_delegators: number;
  direct_vp: Prisma.Decimal;
  advanced_vp: Prisma.Decimal;
  voting_power: Prisma.Decimal;
  statement: DelegateStatement;
};

export type DelegateStats = {
  voter: OptimismVoterStats["voter"];
  proposals_voted: OptimismVoterStats["proposals_voted"];
  for: OptimismVoterStats["for"];
  against: OptimismVoterStats["against"];
  abstain: OptimismVoterStats["abstain"];
  participation_rate: OptimismVoterStats["participation_rate"];
  last_10_props: OptimismVoterStats["last_10_props"];
  voting_power: OptimismVotingPower["voting_power"];
  advanced_vp: OptimismAdvancedVotingPower["advanced_vp"];
  num_of_delegators: OptimismDelegates["num_of_delegators"];
  proposals_proposed: OptimismDelegates["proposals_proposed"];
  total_proposals: number;
  statement: DelegateStatement;
};
