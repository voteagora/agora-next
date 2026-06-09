import { DelegateStatement } from "@/app/api/delegateStatement/delegateStatement";
import { Prisma } from "@prisma/client";

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

type DelegateStatement = {
  created_at: Date;
  discord: string | null;
  endorsed: boolean;
  payload: { delegateStatement: string };
  signature: string;
  twitter: string | null;
  updated_at: Date;
  warpcast: string | null;
  scw_address: string | null;
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
