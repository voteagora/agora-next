import { DelegateStatement } from "@/app/api/delegateStatement/delegateStatement";
import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";

export type Delegate = {
  address: string;
  citizen: boolean;
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
  numOfDelegators: bigint;
  statement: DelegateStatement | null;
};

export type DelegateChunk = Pick<
  Delegate,
  "address" | "votingPower" | "statement" | "citizen"
>;

export type DelegatePayload = Delegate & {
  delegate: string;
  voting_power: number;
};

export type DelegatesGetPayload = {
  delegate: string;
  num_of_delegators: number;
  direct_vp: Decimal;
  advanced_vp: Decimal;
  voting_power: Decimal;
  citizen: boolean;
  statement: DelegateStatement;
};

type DelegateStatement = {
  signature: string;
  payload: { delegateStatement: string };
  twitter: string | null;
  discord: string | null;
  warpcast: string | null;
  created_at: Date;
  updated_at: Date;
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
  statement: DelegateStatement;
  citizen: boolean;
};
