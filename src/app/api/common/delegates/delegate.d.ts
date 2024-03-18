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