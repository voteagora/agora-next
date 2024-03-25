import { DelegateStatement } from "@/app/api/delegateStatement/delegateStatement";
import { Prisma } from "@prisma/client";

export type Delegate = {
  address: string;
  citizen: boolean;
  votingPower: string;
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

export type DelegatePayload = Delegate & {
  delegate: string;
  voting_power: number;
};

export type DelegatesGetPayload = Prisma.OptimismDelegatesGetPayload<true>;

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
};
