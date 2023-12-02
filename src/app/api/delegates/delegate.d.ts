export type DelegateStatement = {
  address: string;
  delegateStatement: string;
  openToSponsoringProposals: string;
  twitter: string;
  discord: string;
};

export type Delegate = {
  address: string;
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
